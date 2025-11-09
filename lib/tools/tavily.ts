// External Tool: Tavily AI Search for web research
// Used by all agents when they need real-time internet information

import { tavily } from '@tavily/core';

let tavilyClient: any = null;

export const getTavilyClient = () => {
  if (!tavilyClient && process.env.TAVILY_API_KEY) {
    tavilyClient = tavily({ apiKey: process.env.TAVILY_API_KEY });
  }
  return tavilyClient;
};

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilySearchOptions {
  maxResults?: number;
  searchDepth?: 'basic' | 'advanced';
  includeAnswer?: boolean;
  includeDomains?: string[];
  excludeDomains?: string[];
}

/**
 * Search the web using Tavily AI
 * @param query - The search query
 * @param options - Search configuration options
 * @returns Array of search results with URLs and content
 */
export async function searchWeb(
  query: string,
  options: TavilySearchOptions = {}
): Promise<{ results: TavilySearchResult[]; answer?: string }> {
  const client = getTavilyClient();
  
  if (!client) {
    console.warn('Tavily API key not configured, returning empty results');
    return { results: [] };
  }

  try {
    const {
      maxResults = 5,
      searchDepth = 'basic',
      includeAnswer = true,
      includeDomains = [],
      excludeDomains = [],
    } = options;

    const response = await client.search(query, {
      max_results: maxResults,
      search_depth: searchDepth,
      include_answer: includeAnswer,
      include_domains: includeDomains.length > 0 ? includeDomains : undefined,
      exclude_domains: excludeDomains.length > 0 ? excludeDomains : undefined,
    });

    const results: TavilySearchResult[] = response.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      content: result.content,
      score: result.score,
    }));

    return {
      results,
      answer: includeAnswer ? response.answer : undefined,
    };
  } catch (error) {
    console.error('Tavily search error:', error);
    return { results: [] };
  }
}

/**
 * Search for productivity and task management resources
 */
export async function searchProductivityResources(query: string): Promise<TavilySearchResult[]> {
  const { results } = await searchWeb(query, {
    maxResults: 3,
    searchDepth: 'basic',
    includeAnswer: false,
  });
  return results;
}

/**
 * Search for neurodivergent-friendly resources
 */
export async function searchNeurodivergentResources(query: string): Promise<TavilySearchResult[]> {
  const enhancedQuery = `${query} ADHD autism neurodivergent executive function`;
  const { results } = await searchWeb(enhancedQuery, {
    maxResults: 4,
    searchDepth: 'basic',
  });
  return results;
}

