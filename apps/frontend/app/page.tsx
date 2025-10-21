'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SearchInput } from './components/SearchInput';
import { SourceCard } from './components/SourceCard';
import { TabNavigation, type Tab } from './components/TabNavigation';
import { AnswerDisplay } from './components/AnswerDisplay';
import {
  getOrCreateCurrentConversation,
  addMessage,
  updateMessage,
  createConversation,
  setCurrentConversationId,
  generateId,
} from '@/lib/conversationStore';
import type { Conversation, Message, SearchResult } from '@/lib/types';

export default function HomePage() {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('perplexity');
  const [currentQuery, setCurrentQuery] = useState('');

  // Load conversation from sessionStorage on mount
  useEffect(() => {
    const conv = getOrCreateCurrentConversation();
    setConversation(conv);
  }, []);

  const handleNewChat = () => {
    const newConv = createConversation();
    setConversation(newConv);
    setActiveTab('perplexity');
    setCurrentQuery('');
  };

  const handleSearch = async (query: string) => {
    if (!conversation || isSearching) return;

    setIsSearching(true);
    setCurrentQuery(query);

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
      // Step 1: Fetch search results
      const searchResponse = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!searchResponse.ok) {
        throw new Error('Search failed');
      }

      const { results: sources } = (await searchResponse.json()) as {
        results: SearchResult[];
      };

      // Step 2: Generate AI answer with citations
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

      const { answer, citations } = await generateResponse.json();

      // Update the answer message with results
      updateMessage(conversation.id, answerMessageId, {
        content: answer,
        sources,
        citations,
        isLoading: false,
      });

      // Reload conversation from storage
      setConversation(getOrCreateCurrentConversation());
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
    }
  };

  // Get the latest answer message for display
  const latestAnswer = conversation?.messages
    .filter((msg) => msg.type === 'answer')
    .pop();

  const hasResults = latestAnswer && !latestAnswer.isLoading;
  const isEmpty = !conversation || conversation.messages.length === 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Sidebar onNewChat={handleNewChat} />

      {/* Main content area */}
      <main className="ml-16 min-h-screen">
        {isEmpty || !hasResults ? (
          /* Empty/Initial State */
          <div className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="w-full max-w-3xl">
              {/* Logo */}
              <h1 className="text-5xl font-light text-center mb-16">
                perplexity
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
          /* Results State */
          <div className="max-w-4xl mx-auto p-8 pt-12">
            {/* Query Display */}
            <h1 className="text-3xl font-medium mb-8">{currentQuery}</h1>

            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              sourcesCount={latestAnswer.sources?.length || 0}
            />

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === 'perplexity' && (
                <div className="space-y-6">
                  {/* Sources - Horizontal Scroll */}
                  {latestAnswer.sources && latestAnswer.sources.length > 0 && (
                    <div className="overflow-x-auto pb-4 -mx-4 px-4">
                      <div className="flex gap-4">
                        {latestAnswer.sources.map((source, index) => (
                          <SourceCard
                            key={source.link}
                            source={source}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Answer */}
                  {latestAnswer.isLoading ? (
                    <div className="flex items-center gap-3 text-zinc-400">
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-150" />
                      <span className="ml-2">Thinking...</span>
                    </div>
                  ) : (
                    <AnswerDisplay
                      answer={latestAnswer.content}
                      sources={latestAnswer.sources}
                    />
                  )}
                </div>
              )}

              {activeTab === 'sources' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {latestAnswer.sources?.map((source, index) => (
                    <div key={source.link} className="w-full">
                      <SourceCard source={source} index={index} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Follow-up Input */}
            <div className="mt-12">
              <SearchInput
                onSubmit={handleSearch}
                isLoading={isSearching}
                placeholder="Ask a follow-up..."
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
