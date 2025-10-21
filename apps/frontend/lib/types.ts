// Core conversation types
export interface Conversation {
  id: string;
  title?: string; // Generated from first query
  messages: Message[];
  createdAt: number;
}

export interface Message {
  id: string;
  type: 'query' | 'answer';
  content: string;
  sources?: SearchResult[];
  citations?: Citation[];
  timestamp: number;
  isLoading?: boolean;
  suggestedQuestions?: string[]; // AI-generated follow-up questions
}

// Search-related types
export interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  favicon?: string;
  position: number;
}

export interface Citation {
  number: number;
  sourceIndex: number;
  text: string;
}

// API request/response types
export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  results: SearchResult[];
  searchMetadata?: {
    id: string;
    status: string;
    created_at: string;
    processed_at: string;
    total_time_taken: number;
  };
}

export interface GenerateRequest {
  query: string;
  sources: SearchResult[];
  conversationHistory?: Message[];
}

export interface GenerateResponse {
  answer: string;
  citations: Citation[];
}

// SerpAPI response types
export interface SerpAPIResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_url: string;
    raw_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q: string;
    google_domain: string;
    hl: string;
    gl: string;
    device: string;
  };
  search_information: {
    query_displayed: string;
    total_results: number;
    time_taken_displayed: number;
    organic_results_state: string;
  };
  organic_results: Array<{
    position: number;
    title: string;
    link: string;
    redirect_link?: string;
    displayed_link?: string;
    favicon?: string;
    snippet: string;
    snippet_highlighted_words?: string[];
    sitelinks?: {
      inline?: Array<{
        title: string;
        link: string;
      }>;
    };
    rich_snippet?: any;
    about_this_result?: {
      source: {
        description: string;
        source_info_link: string;
        security: string;
        icon: string;
      };
    };
    about_page_link?: string;
    about_page_serpapi_link?: string;
    cached_page_link?: string;
    related_pages_link?: string;
    source?: string;
  }>;
}
