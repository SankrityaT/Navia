// External Tool: Finance APIs for budgeting, financial planning, and money management
// Provides real-time financial data and resources

import axios from 'axios';
import { searchWeb } from './tavily';

export interface FinanceResource {
  title: string;
  description: string;
  url: string;
  category: 'budgeting' | 'savings' | 'debt' | 'benefits' | 'tools';
}

/**
 * Search for financial resources and advice
 */
export async function searchFinancialResources(
  query: string,
  category?: string
): Promise<FinanceResource[]> {
  try {
    // Use Tavily to search for financial resources
    const searchQuery = category 
      ? `${query} ${category} young adults neurodivergent financial planning`
      : `${query} financial planning budgeting young adults`;

    const { results } = await searchWeb(searchQuery, {
      maxResults: 5,
      searchDepth: 'basic',
      includeDomains: [
        'nerdwallet.com',
        'mint.com',
        'ynab.com',
        'reddit.com/r/personalfinance',
        'investopedia.com',
      ],
    });

    return results.map((result) => ({
      title: result.title,
      description: result.content,
      url: result.url,
      category: categorizeFinanceResource(result.title + ' ' + result.content),
    }));
  } catch (error) {
    console.error('Finance resource search error:', error);
    return [];
  }
}

/**
 * Get budgeting tips and templates
 */
export async function getBudgetingTips(): Promise<FinanceResource[]> {
  return searchFinancialResources('budgeting templates tips beginners', 'budgeting');
}

/**
 * Search for student benefits and financial aid information
 */
export async function searchStudentBenefits(query: string): Promise<FinanceResource[]> {
  const searchQuery = `${query} student benefits financial aid disability accommodations`;
  
  const { results } = await searchWeb(searchQuery, {
    maxResults: 4,
    searchDepth: 'basic',
    includeDomains: [
      'studentaid.gov',
      'benefits.gov',
      'ssa.gov',
      'ed.gov',
    ],
  });

  return results.map((result) => ({
    title: result.title,
    description: result.content,
    url: result.url,
    category: 'benefits',
  }));
}

/**
 * Get information about popular budgeting apps and tools
 */
export async function getBudgetingTools(): Promise<FinanceResource[]> {
  const tools = [
    {
      title: 'YNAB (You Need A Budget)',
      description: 'Zero-based budgeting app with strong emphasis on planning ahead. Great for ADHD users with its clear visual system.',
      url: 'https://www.ynab.com',
      category: 'tools' as const,
    },
    {
      title: 'Mint',
      description: 'Free budgeting app that automatically tracks expenses. Good for users who struggle with manual entry.',
      url: 'https://www.mint.com',
      category: 'tools' as const,
    },
    {
      title: 'PocketGuard',
      description: 'Simplified budgeting focused on "In My Pocket" concept. Reduces cognitive load with simple interface.',
      url: 'https://www.pocketguard.com',
      category: 'tools' as const,
    },
    {
      title: 'Goodbudget',
      description: 'Envelope budgeting system. Visual and tactile approach good for neurodivergent users.',
      url: 'https://www.goodbudget.com',
      category: 'tools' as const,
    },
  ];

  return tools;
}

/**
 * Get debt management strategies
 */
export async function getDebtManagementAdvice(query: string): Promise<FinanceResource[]> {
  return searchFinancialResources(`${query} debt management strategies`, 'debt');
}

/**
 * Categorize a finance resource based on content
 */
function categorizeFinanceResource(content: string): 'budgeting' | 'savings' | 'debt' | 'benefits' | 'tools' {
  const lowerContent = content.toLowerCase();
  
  if (lowerContent.includes('budget') || lowerContent.includes('expense')) {
    return 'budgeting';
  } else if (lowerContent.includes('saving') || lowerContent.includes('emergency fund')) {
    return 'savings';
  } else if (lowerContent.includes('debt') || lowerContent.includes('loan') || lowerContent.includes('credit')) {
    return 'debt';
  } else if (lowerContent.includes('benefit') || lowerContent.includes('aid') || lowerContent.includes('assistance')) {
    return 'benefits';
  } else {
    return 'tools';
  }
}

/**
 * Get simple financial advice for a specific question
 */
export async function getFinancialAdvice(question: string): Promise<string> {
  try {
    const { answer, results } = await searchWeb(
      `${question} personal finance advice for young adults`,
      {
        maxResults: 3,
        searchDepth: 'basic',
        includeAnswer: true,
      }
    );

    return answer || results[0]?.content || 'Unable to find specific advice. Consider consulting a financial advisor.';
  } catch (error) {
    console.error('Financial advice error:', error);
    return 'Unable to retrieve financial advice at this time.';
  }
}

