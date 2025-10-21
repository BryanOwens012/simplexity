import { NextRequest, NextResponse } from 'next/server';
import { getJson } from 'serpapi';
import type { SearchRequest, SearchResponse, SerpAPIResponse, SearchResult } from '@/lib/types';

export const POST = async (req: NextRequest) => {
  try {
    const { query } = (await req.json()) as SearchRequest;

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.SERPAPI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'SerpAPI key not configured' },
        { status: 500 }
      );
    }

    // Call SerpAPI using the official client library
    const data = (await getJson({
      engine: 'google',
      api_key: apiKey,
      q: query,
      google_domain: 'google.com',
      gl: 'us',
      hl: 'en',
      num: 10, // Get top 10 results
    })) as SerpAPIResponse;

    // Transform SerpAPI results to our SearchResult format
    const results: SearchResult[] = (data.organic_results || []).map((result) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      favicon: result.favicon,
      position: result.position,
    }));

    // Stream results one by one
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send results one at a time with small delay for better UX
          for (let i = 0; i < results.length; i++) {
            const chunk = JSON.stringify({ type: 'result', data: results[i] }) + '\n';
            controller.enqueue(encoder.encode(chunk));

            // Small delay between results for streaming effect
            if (i < results.length - 1) {
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          }

          // Send completion signal
          const doneChunk = JSON.stringify({ type: 'done' }) + '\n';
          controller.enqueue(encoder.encode(doneChunk));
          controller.close();
        } catch (error) {
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
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
