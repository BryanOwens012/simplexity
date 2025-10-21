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

    // Stream Claude API response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const messageStream = await anthropic.messages.create({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 2048,
            system: systemPrompt,
            messages: [
              {
                role: 'user',
                content: userPrompt,
              },
            ],
            stream: true,
          });

          let fullText = '';

          for await (const event of messageStream) {
            if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                const text = event.delta.text;
                fullText += text;

                // Send text chunk
                const chunk = JSON.stringify({ type: 'text', data: text }) + '\n';
                controller.enqueue(encoder.encode(chunk));
              }
            } else if (event.type === 'message_stop') {
              // Extract citations from full text
              const citationRegex = /\[(\d+)\]/g;
              const citationMatches = [...fullText.matchAll(citationRegex)];

              const citations: Citation[] = citationMatches.map((match) => {
                const sourceIndex = parseInt(match[1], 10) - 1;
                return {
                  number: parseInt(match[1], 10),
                  sourceIndex: sourceIndex >= 0 && sourceIndex < sources.length ? sourceIndex : 0,
                  text: match[0],
                };
              });

              // Remove duplicate citations
              const uniqueCitations = citations.filter(
                (citation, index, self) =>
                  index === self.findIndex((c) => c.number === citation.number)
              );

              // Send citations
              const citationsChunk = JSON.stringify({
                type: 'citations',
                data: uniqueCitations
              }) + '\n';
              controller.enqueue(encoder.encode(citationsChunk));

              // Send done signal
              const doneChunk = JSON.stringify({ type: 'done' }) + '\n';
              controller.enqueue(encoder.encode(doneChunk));
              controller.close();
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
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
