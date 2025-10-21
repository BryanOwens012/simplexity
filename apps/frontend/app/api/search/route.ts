import { NextRequest, NextResponse } from 'next/server';
import type { SearchRequest, SearchResponse, SerpAPIResponse, SearchResult } from '@/lib/types';

export const runtime = 'edge';

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

    // Call SerpAPI
    const searchParams = new URLSearchParams({
      api_key: apiKey,
      q: query,
      engine: 'google',
      google_domain: 'google.com',
      gl: 'us',
      hl: 'en',
      num: '10', // Get top 10 results
    });

    const response = await fetch(
      `https://serpapi.com/search?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SerpAPI error:', errorText);
      return NextResponse.json(
        { error: 'Search API request failed' },
        { status: response.status }
      );
    }

    const data = (await response.json()) as SerpAPIResponse;

    // Transform SerpAPI results to our SearchResult format
    const results: SearchResult[] = (data.organic_results || []).map((result) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      favicon: result.favicon,
      position: result.position,
    }));

    const searchResponse: SearchResponse = {
      results,
      searchMetadata: data.search_metadata,
    };

    return NextResponse.json(searchResponse);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
};
