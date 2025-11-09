// External Tool: Career search and workplace resources
// Provides job search assistance, resume help, and workplace accommodation information

import { searchWeb, TavilySearchResult } from './tavily';

export interface CareerResource {
  title: string;
  description: string;
  url: string;
  category: 'job_search' | 'resume' | 'interview' | 'accommodations' | 'career_advice';
}

export interface JobSearchResult {
  title: string;
  company?: string;
  location?: string;
  description: string;
  url: string;
}

/**
 * Search for career resources and advice
 */
export async function searchCareerResources(
  query: string,
  category?: string
): Promise<CareerResource[]> {
  try {
    const searchQuery = category
      ? `${query} ${category} career development neurodivergent workplace`
      : `${query} career advice job search young professionals`;

    const { results } = await searchWeb(searchQuery, {
      maxResults: 5,
      searchDepth: 'basic',
    });

    return results.map((result) => ({
      title: result.title,
      description: result.content,
      url: result.url,
      category: categorizeCareerResource(result.title + ' ' + result.content),
    }));
  } catch (error) {
    console.error('Career resource search error:', error);
    return [];
  }
}

/**
 * Search for jobs (using web search as fallback)
 */
export async function searchJobs(
  query: string,
  location?: string
): Promise<JobSearchResult[]> {
  try {
    const searchQuery = location
      ? `${query} jobs ${location} site:linkedin.com OR site:indeed.com OR site:glassdoor.com`
      : `${query} jobs remote site:linkedin.com OR site:indeed.com`;

    const { results } = await searchWeb(searchQuery, {
      maxResults: 5,
      searchDepth: 'basic',
      includeDomains: ['linkedin.com', 'indeed.com', 'glassdoor.com'],
    });

    return results.map((result) => ({
      title: extractJobTitle(result.title),
      company: extractCompany(result.title),
      location: location || 'Remote',
      description: result.content,
      url: result.url,
    }));
  } catch (error) {
    console.error('Job search error:', error);
    return [];
  }
}

/**
 * Get resume templates and tips
 */
export async function getResumeHelp(focus?: string): Promise<CareerResource[]> {
  const query = focus
    ? `resume templates ${focus} ATS friendly tips`
    : 'resume templates tips ATS neurodivergent friendly';

  const { results } = await searchWeb(query, {
    maxResults: 4,
    searchDepth: 'basic',
    includeDomains: ['resumegenius.com', 'thebalancemoney.com', 'zety.com', 'indeed.com'],
  });

  return results.map((result) => ({
    title: result.title,
    description: result.content,
    url: result.url,
    category: 'resume' as const,
  }));
}

/**
 * Get interview preparation resources
 */
export async function getInterviewPrep(jobType?: string): Promise<CareerResource[]> {
  const query = jobType
    ? `${jobType} interview questions tips preparation`
    : 'job interview tips questions common answers neurodivergent';

  const { results } = await searchWeb(query, {
    maxResults: 5,
    searchDepth: 'basic',
  });

  return results.map((result) => ({
    title: result.title,
    description: result.content,
    url: result.url,
    category: 'interview' as const,
  }));
}

/**
 * Search for workplace accommodation information
 */
export async function getWorkplaceAccommodations(condition?: string): Promise<CareerResource[]> {
  const query = condition
    ? `workplace accommodations ${condition} ADA rights reasonable accommodations`
    : 'workplace accommodations neurodivergent ADHD autism ADA rights';

  const { results } = await searchWeb(query, {
    maxResults: 5,
    searchDepth: 'advanced',
    includeDomains: ['askjan.org', 'ada.gov', 'eeoc.gov', 'dol.gov'],
  });

  return results.map((result) => ({
    title: result.title,
    description: result.content,
    url: result.url,
    category: 'accommodations' as const,
  }));
}

/**
 * Get career transition advice
 */
export async function getCareerTransitionAdvice(
  fromField: string,
  toField: string
): Promise<CareerResource[]> {
  const query = `career change from ${fromField} to ${toField} transition guide skills transferable`;

  const { results } = await searchWeb(query, {
    maxResults: 4,
    searchDepth: 'basic',
  });

  return results.map((result) => ({
    title: result.title,
    description: result.content,
    url: result.url,
    category: 'career_advice' as const,
  }));
}

/**
 * Get networking tips for neurodivergent professionals
 */
export async function getNetworkingTips(): Promise<CareerResource[]> {
  const { results } = await searchWeb(
    'networking tips neurodivergent professionals ADHD autism introvert',
    {
      maxResults: 4,
      searchDepth: 'basic',
    }
  );

  return results.map((result) => ({
    title: result.title,
    description: result.content,
    url: result.url,
    category: 'career_advice' as const,
  }));
}

/**
 * Categorize a career resource based on content
 */
function categorizeCareerResource(
  content: string
): 'job_search' | 'resume' | 'interview' | 'accommodations' | 'career_advice' {
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('resume') || lowerContent.includes('cv')) {
    return 'resume';
  } else if (lowerContent.includes('interview')) {
    return 'interview';
  } else if (
    lowerContent.includes('accommodation') ||
    lowerContent.includes('ada') ||
    lowerContent.includes('disability')
  ) {
    return 'accommodations';
  } else if (
    lowerContent.includes('job') ||
    lowerContent.includes('hiring') ||
    lowerContent.includes('application')
  ) {
    return 'job_search';
  } else {
    return 'career_advice';
  }
}

/**
 * Extract job title from search result title
 */
function extractJobTitle(title: string): string {
  // Remove common suffixes and site names
  return title
    .replace(/\s*-\s*(LinkedIn|Indeed|Glassdoor).*$/i, '')
    .replace(/\s*\|\s*.*$/i, '')
    .trim();
}

/**
 * Extract company name from search result title
 */
function extractCompany(title: string): string | undefined {
  // Try to extract company name from patterns like "Title at Company" or "Title - Company"
  const match = title.match(/(?:at|@|-)\s*([^-|]+?)(?:\s*-|\s*\||$)/i);
  return match ? match[1].trim() : undefined;
}

