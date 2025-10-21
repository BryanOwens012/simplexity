import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { GenerateRequest, GenerateResponse, Citation } from '@/lib/types';

export const POST = async (req: NextRequest) => {
  try {
    const { query, sources, conversationHistory } = (await req.json()) as GenerateRequest;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    if (!sources || sources.length === 0) {
      return NextResponse.json(
        { error: 'Sources are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key not configured' },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({
      apiKey,
    });

    // Format sources for the prompt
    const sourcesContext = sources
      .map((source, index) => {
        return `[${index + 1}] ${source.title}\n${source.snippet}\nSource: ${source.link}`;
      })
      .join('\n\n');

    // Build conversation history context if available
    const historyContext = conversationHistory && conversationHistory.length > 0
      ? conversationHistory
          .filter((msg) => msg.type === 'query' || msg.type === 'answer')
          .map((msg) => `${msg.type === 'query' ? 'User' : 'Assistant'}: ${msg.content}`)
          .join('\n\n')
      : '';

    const systemPrompt = `You are a helpful AI assistant that answers questions based on search results. Your task is to:
1. Analyze the provided search results
2. Generate a comprehensive, accurate answer to the user's question
3. Include inline citations using [1], [2], etc. to reference specific sources
4. Only use information from the provided sources
5. If the sources don't contain enough information, acknowledge this
6. Write in a clear, informative style similar to Simplexity.ai

IMPORTANT: When citing sources, use the format [1], [2], etc. to reference the numbered sources provided.`;

    const userPrompt = `${historyContext ? `Previous conversation:\n${historyContext}\n\n` : ''}User's question: ${query}

Search results:
${sourcesContext}

Please provide a comprehensive answer to the user's question, using inline citations [1], [2], etc. to reference the sources above.`;

    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    // Extract text content from Claude's response
    const textContent = message.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response from AI' },
        { status: 500 }
      );
    }

    const answer = textContent.text;

    // Extract citations from the answer
    // Look for patterns like [1], [2], etc.
    const citationRegex = /\[(\d+)\]/g;
    const citationMatches = [...answer.matchAll(citationRegex)];

    const citations: Citation[] = citationMatches.map((match, index) => {
      const sourceIndex = parseInt(match[1], 10) - 1; // Convert to 0-indexed
      return {
        number: parseInt(match[1], 10),
        sourceIndex: sourceIndex >= 0 && sourceIndex < sources.length ? sourceIndex : 0,
        text: match[0],
      };
    });

    // Remove duplicate citations (same number referenced multiple times)
    const uniqueCitations = citations.filter(
      (citation, index, self) =>
        index === self.findIndex((c) => c.number === citation.number)
    );

    const response: GenerateResponse = {
      answer,
      citations: uniqueCitations,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Generate API error:', error);

    // Handle Anthropic-specific errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AI API error: ${error.message}` },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
