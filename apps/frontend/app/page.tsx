'use client';

import { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { SearchInput } from './components/SearchInput';
import { SourceCard } from './components/SourceCard';
import { TabNavigation, type Tab } from './components/TabNavigation';
import { AnswerDisplay } from './components/AnswerDisplay';
import { SuggestedQuestions } from './components/SuggestedQuestions';
import {
  getOrCreateCurrentConversation,
  getAllConversations,
  getConversation,
  getCurrentConversationId,
  addMessage,
  updateMessage,
  createConversation,
  setCurrentConversationId,
  deleteConversation,
  generateId,
} from '@/lib/conversationStore';
import type { Conversation, Message, SearchResult } from '@/lib/types';

export default function HomePage() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [allConversations, setAllConversations] = useState<Conversation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('simplexity');
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const latestQueryRef = useRef<HTMLDivElement>(null);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load conversation from sessionStorage on mount
  useEffect(() => {
    const conv = getOrCreateCurrentConversation();
    setConversation(conv);
    setAllConversations(getAllConversations());
  }, []);

  // Auto-scroll to latest query when new message is added
  useEffect(() => {
    if (latestQueryRef.current) {
      latestQueryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [conversation?.messages.length]);

  // Stopwatch for loading state
  useEffect(() => {
    if (isSearching) {
      // Reset and start timer
      setLoadingSeconds(0);
      loadingIntervalRef.current = setInterval(() => {
        setLoadingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      // Clear timer when not loading
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
        loadingIntervalRef.current = null;
      }
      setLoadingSeconds(0);
    }

    // Cleanup on unmount
    return () => {
      if (loadingIntervalRef.current) {
        clearInterval(loadingIntervalRef.current);
      }
    };
  }, [isSearching]);

  const handleNewChat = () => {
    const newConv = createConversation();
    setConversation(newConv);
    setAllConversations(getAllConversations());
    setActiveTab('simplexity');
  };

  const handleSelectConversation = (id: string) => {
    const selected = getConversation(id);
    if (selected) {
      setCurrentConversationId(id);
      setConversation(selected);
      setActiveTab('simplexity');
    }
  };

  const handleDeleteConversation = (id: string) => {
    deleteConversation(id);
    setAllConversations(getAllConversations());

    // If we deleted the current conversation, create a new one
    if (conversation?.id === id) {
      const newConv = createConversation();
      setConversation(newConv);
      setAllConversations(getAllConversations());
    }
  };

  const generateSuggestedQuestions = async (
    query: string,
    answer: string,
    conversationHistory: Message[],
    answerMessageId: string
  ) => {
    if (!conversation) return;

    setGeneratingQuestions(true);

    try {
      const response = await fetch('/api/suggest-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuery: query,
          currentAnswer: answer,
          conversationHistory: conversationHistory.slice(-4),
        }),
      });

      if (response.ok) {
        const { questions } = await response.json();

        // Update answer message with suggested questions
        updateMessage(conversation.id, answerMessageId, {
          suggestedQuestions: questions,
        });
        setConversation(getOrCreateCurrentConversation());
      }
    } catch (error) {
      console.error('Error generating suggested questions:', error);
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!conversation || isSearching) return;

    setIsSearching(true);

    // Add user query message
    const queryMessage: Message = {
      id: generateId(),
      type: 'query',
      content: query,
      timestamp: Date.now(),
    };

    addMessage(conversation.id, queryMessage);

    // Add a loading answer message
    const answerMessageId = generateId();
    const loadingAnswerMessage: Message = {
      id: answerMessageId,
      type: 'answer',
      content: '',
      timestamp: Date.now(),
      isLoading: true,
    };

    addMessage(conversation.id, loadingAnswerMessage);

    // Update local state
    const updatedConv = {
      ...conversation,
      messages: [...conversation.messages, queryMessage, loadingAnswerMessage],
    };
    setConversation(updatedConv);

    try {
      // Step 1: Fetch search results (streaming)
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!searchResponse.ok) {
        throw new Error('Search failed');
      }

      // Read streaming results
      const sources: SearchResult[] = [];
      let fullAnswer = '';
      const reader = searchResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const message = JSON.parse(line);

                if (message.type === 'result') {
                  sources.push(message.data);

                  // Update UI with new source
                  updateMessage(conversation.id, answerMessageId, {
                    sources: [...sources],
                  });
                  setConversation(getOrCreateCurrentConversation());
                } else if (message.type === 'done') {
                  break;
                }
              } catch (e) {
                console.error('Error parsing streaming chunk:', e);
              }
            }
          }
        }
      }

      // Step 2: Generate AI answer with citations (streaming)
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          sources,
          conversationHistory: conversation.messages.slice(-4), // Last 2 exchanges
        }),
      });

      if (!generateResponse.ok) {
        throw new Error('Answer generation failed');
      }

      // Read streaming answer
      const genReader = generateResponse.body?.getReader();
      const genDecoder = new TextDecoder();

      if (genReader) {
        let buffer = '';
        let citations: any[] = [];

        while (true) {
          const { done, value } = await genReader.read();

          if (done) break;

          buffer += genDecoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim()) {
              try {
                const message = JSON.parse(line);

                if (message.type === 'text') {
                  fullAnswer += message.data;

                  // Update UI with streaming text
                  updateMessage(conversation.id, answerMessageId, {
                    content: fullAnswer,
                    sources,
                    isLoading: false,
                  });
                  setConversation(getOrCreateCurrentConversation());
                } else if (message.type === 'citations') {
                  citations = message.data;

                  // Update with final citations
                  updateMessage(conversation.id, answerMessageId, {
                    content: fullAnswer,
                    sources,
                    citations,
                    isLoading: false,
                  });
                  setConversation(getOrCreateCurrentConversation());
                } else if (message.type === 'done') {
                  break;
                }
              } catch (e) {
                console.error('Error parsing streaming chunk:', e);
              }
            }
          }
        }
      }

      // Step 3: Generate suggested questions in background
      // Don't await - let it run in background
      generateSuggestedQuestions(query, fullAnswer, conversation.messages, answerMessageId);
    } catch (error) {
      console.error('Search error:', error);

      // Update message with error
      updateMessage(conversation.id, answerMessageId, {
        content: 'Sorry, there was an error processing your request. Please try again.',
        isLoading: false,
      });

      setConversation(getOrCreateCurrentConversation());
    } finally {
      setIsSearching(false);
      setAllConversations(getAllConversations());
    }
  };

  const isEmpty = !conversation || conversation.messages.length === 0;

  // Group messages into Q&A pairs
  const qaPairs: Array<{ query: Message; answer: Message }> = [];
  if (conversation) {
    for (let i = 0; i < conversation.messages.length; i += 2) {
      const query = conversation.messages[i];
      const answer = conversation.messages[i + 1];
      if (query?.type === 'query' && answer?.type === 'answer') {
        qaPairs.push({ query, answer });
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar
        onNewChat={handleNewChat}
        conversations={allConversations}
        currentConversationId={conversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      {/* Main content area */}
      <main className="ml-64 min-h-screen">
        {isEmpty ? (
          /* Empty/Initial State */
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="w-full max-w-3xl">
              {/* Logo */}
              <h1 className="text-5xl font-light text-center mb-16">
                simplexity
              </h1>

              {/* Search Input */}
              <SearchInput
                onSubmit={handleSearch}
                isLoading={isSearching}
                placeholder="Ask anything..."
              />
            </div>
          </div>
        ) : (
          /* Conversation Thread */
          <div className="max-w-4xl mx-auto p-8 pt-12 pb-24">
            {qaPairs.map((pair, pairIndex) => {
              const isLatest = pairIndex === qaPairs.length - 1;

              return (
                <div
                  key={pair.query.id}
                  ref={isLatest ? latestQueryRef : null}
                  className="mb-16 scroll-mt-12"
                >
                  {/* Query Display */}
                  <h1 className="text-3xl font-medium mb-8">{pair.query.content}</h1>

                  {/* Tab Navigation - Only show for latest Q&A */}
                  {isLatest && (
                    <TabNavigation
                      activeTab={activeTab}
                      onTabChange={setActiveTab}
                      sourcesCount={pair.answer.sources?.length || 0}
                    />
                  )}

                  {/* Answer Content */}
                  <div className="mt-6">
                    {activeTab === 'simplexity' || !isLatest ? (
                      <div className="space-y-6">
                        {/* Sources - Horizontal Scroll */}
                        {pair.answer.sources && pair.answer.sources.length > 0 && (
                          <div className="overflow-x-auto pb-4 -mx-4 px-4">
                            <div className="flex gap-3">
                              {pair.answer.sources.map((source, index) => (
                                <div key={source.link} className="w-72 flex-shrink-0">
                                  <SourceCard
                                    source={source}
                                    index={index}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* AI Answer or Loading */}
                        {pair.answer.isLoading ? (
                          <div className="space-y-3">
                            {/* Skeleton loader */}
                            <div className="flex items-center gap-3 text-zinc-400 mb-6">
                              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-75" />
                              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-150" />
                              <span className="ml-2">Thinking... {loadingSeconds}s</span>
                            </div>
                            {/* Skeleton text lines */}
                            <div className="space-y-2">
                              <div className="h-4 bg-zinc-800/50 rounded w-full animate-pulse" />
                              <div className="h-4 bg-zinc-800/50 rounded w-5/6 animate-pulse delay-75" />
                              <div className="h-4 bg-zinc-800/50 rounded w-4/5 animate-pulse delay-150" />
                            </div>
                          </div>
                        ) : (
                          <>
                            <AnswerDisplay
                              answer={pair.answer.content}
                              sources={pair.answer.sources}
                            />
                            {/* Suggested Questions - Only for latest Q&A */}
                            {isLatest && (
                              <SuggestedQuestions
                                questions={pair.answer.suggestedQuestions || []}
                                onQuestionClick={handleSearch}
                                isLoading={generatingQuestions}
                              />
                            )}
                          </>
                        )}
                      </div>
                    ) : activeTab === 'sources' && isLatest ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pair.answer.sources?.map((source, index) => (
                          <SourceCard key={source.link} source={source} index={index} />
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}

            {/* Follow-up Input - Fixed at bottom */}
            <div className="fixed bottom-0 left-64 right-0 bg-gradient-to-t from-zinc-950 via-zinc-950 to-transparent pt-8 pb-6">
              <div className="max-w-4xl mx-auto px-8">
                <SearchInput
                  onSubmit={handleSearch}
                  isLoading={isSearching}
                  placeholder="Ask a follow-up..."
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
