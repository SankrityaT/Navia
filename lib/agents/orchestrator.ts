// Main Orchestrator
// Routes queries to appropriate agents and coordinates multi-agent responses

import { groqStructuredOutput } from '../groq/client';
import { ORCHESTRATOR_INTENT_PROMPT } from './prompts';
import {
  IntentDetection,
  AgentContext,
  AIResponse,
  OrchestrationResult,
  AgentDomain,
  ResourceLink,
  SourceReference,
} from './types';
import { processFinanceQuery } from './finance';
import { processCareerQuery } from './career';
import { processDailyTaskQuery } from './daily-task';
import { containsBreakdownKeywords } from './breakdown';
import { retrieveChatHistory } from '../pinecone/chat-history';

/**
 * Detect user intent and determine which agent(s) to route to
 */
export async function detectIntent(query: string): Promise<IntentDetection> {
  try {
    const hasBreakdownKeywords = containsBreakdownKeywords(query);

    const prompt = `Analyze this user query and determine routing:

Query: "${query}"

Respond in JSON format following your schema.`;

    const response = await groqStructuredOutput([
      { role: 'system', content: ORCHESTRATOR_INTENT_PROMPT + '\n\nYou must respond in valid JSON format.' },
      { role: 'user', content: prompt },
    ]);

    const detection: IntentDetection = JSON.parse(response.message.content || '{}');

    // Override needsBreakdown if keywords detected
    if (hasBreakdownKeywords) {
      detection.needsBreakdown = true;
    }

    // Ensure at least one domain
    if (!detection.domains || detection.domains.length === 0) {
      detection.domains = ['daily_task']; // Default fallback
      detection.confidence = 0.5;
    }

    return {
      domains: detection.domains,
      confidence: detection.confidence || 0.7,
      needsBreakdown: detection.needsBreakdown || false,
      complexity: detection.complexity || 5,
      reasoning: detection.reasoning || 'Intent detected',
    };
  } catch (error) {
    console.error('Intent detection error:', error);
    
    // Fallback to daily_task agent
    return {
      domains: ['daily_task'],
      confidence: 0.5,
      needsBreakdown: false,
      complexity: 5,
      reasoning: 'Error in intent detection, defaulting to daily task agent',
    };
  }
}

/**
 * Route query to appropriate agent(s) and orchestrate responses
 */
export async function orchestrateQuery(
  userId: string,
  query: string,
  userContext?: any
): Promise<OrchestrationResult> {
  const startTime = Date.now();

  try {
    // Step 1: Detect intent
    const intent = await detectIntent(query);
    console.log(`Intent detected: ${intent.domains.join(', ')} (confidence: ${intent.confidence})`);

    // Step 2: Retrieve chat history for context
    const chatHistory = await retrieveChatHistory(userId, 5);

    // Step 3: Build agent context
    const agentContext: AgentContext = {
      userId,
      query,
      userContext,
      chatHistory,
    };

    // Step 4: Route to agent(s)
    const responses: AIResponse[] = [];
    
    for (const domain of intent.domains) {
      try {
        let agentResponse: AIResponse;

        switch (domain) {
          case 'finance':
            agentResponse = await processFinanceQuery(agentContext);
            break;
          case 'career':
            agentResponse = await processCareerQuery(agentContext);
            break;
          case 'daily_task':
            agentResponse = await processDailyTaskQuery(agentContext);
            break;
          default:
            // Fallback to daily task
            agentResponse = await processDailyTaskQuery(agentContext);
        }

        responses.push(agentResponse);
      } catch (agentError) {
        console.error(`Error in ${domain} agent:`, agentError);
        // Continue with other agents if one fails
      }
    }

    // Step 5: If no responses, return error
    if (responses.length === 0) {
      return {
        success: false,
        responses: [],
        metadata: {
          domainsInvolved: intent.domains,
          executionTime: Date.now() - startTime,
          usedBreakdown: false,
          error: 'All agents failed to process query',
        },
      };
    }

    // Step 6: Combine responses if multiple agents were used
    const combinedSummary = responses.length > 1
      ? combineMultiAgentResponses(responses)
      : responses[0].summary;

    // Step 7: Combine breakdowns if multiple
    const allBreakdowns = responses
      .filter((r) => r.breakdown && r.breakdown.length > 0)
      .flatMap((r) => r.breakdown!);

    // Step 8: Combine all resources and sources
    const allResources = responses
      .flatMap((r) => r.resources || [])
      .filter((resource, index, self) => 
        index === self.findIndex((r) => r.url === resource.url)
      ); // Remove duplicates by URL

    const allSources = responses
      .flatMap((r) => r.sources || [])
      .filter((source, index, self) => 
        index === self.findIndex((s) => s.url === source.url)
      ); // Remove duplicates by URL

    // Step 9: Return orchestrated result
    const executionTime = Date.now() - startTime;
    
    // Check if any agent suggests breakdown but didn't generate one
    const needsBreakdown = responses.some(
      (r) => r.metadata?.needsBreakdown && (!r.breakdown || r.breakdown.length === 0)
    ) || (allBreakdowns.length === 0 && intent.needsBreakdown);

    return {
      success: true,
      responses,
      combinedSummary: responses.length > 1 ? combinedSummary : undefined,
      breakdown: allBreakdowns.length > 0 ? allBreakdowns : undefined,
      allSources: allSources.slice(0, 8),
      allResources: allResources.slice(0, 10),
      metadata: {
        domainsInvolved: intent.domains,
        executionTime,
        usedBreakdown: allBreakdowns.length > 0,
        needsBreakdown, // CRITICAL: Include this for frontend button detection!
        confidence: intent.confidence,
        complexity: intent.complexity,
        multiAgent: responses.length > 1,
      },
    };

  } catch (error) {
    console.error('Orchestration error:', error);
    
    return {
      success: false,
      responses: [],
      metadata: {
        domainsInvolved: [],
        executionTime: Date.now() - startTime,
        usedBreakdown: false,
        error: 'Orchestration failed',
      },
    };
  }
}

/**
 * Combine multiple agent responses into a coherent summary
 */
function combineMultiAgentResponses(responses: AIResponse[]): string {
  if (responses.length === 0) return '';
  if (responses.length === 1) return responses[0].summary;

  const domainLabels: Record<AgentDomain, string> = {
    finance: '💰 Finance Guidance',
    career: '💼 Career Guidance',
    daily_task: '✅ Task Management Guidance',
  };

  const sections = responses
    .map((response) => {
      const label = domainLabels[response.domain];
      return `${label}:\n${response.summary}`;
    })
    .join('\n\n---\n\n');

  const intro = responses.length === 2
    ? `I've analyzed your question from multiple perspectives. Here's comprehensive guidance:`
    : `Your question touches on several areas. Here's what I can help with:`;

  return `${intro}\n\n${sections}`;
}

/**
 * Quick intent detection for simple routing (no full orchestration)
 */
export async function quickDetectDomain(query: string): Promise<AgentDomain> {
  try {
    const intent = await detectIntent(query);
    return intent.domains[0]; // Return primary domain
  } catch (error) {
    return 'daily_task'; // Safe fallback
  }
}

/**
 * Check if query requires multi-agent response
 */
export function isMultiDomainQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // Patterns that typically span multiple domains
  const multiDomainPatterns = [
    /work.*life.*balance/i,
    /job.*money/i,
    /career.*finances/i,
    /manage.*everything/i,
    /organize.*life/i,
  ];

  return multiDomainPatterns.some((pattern) => pattern.test(query));
}

/**
 * Get agent statistics for monitoring
 */
export async function getAgentStats(userId: string) {
  try {
    const history = await retrieveChatHistory(userId, 50);
    
    const stats = {
      totalQueries: history.length,
      byDomain: {
        finance: history.filter((h) => h.category === 'finance').length,
        career: history.filter((h) => h.category === 'career').length,
        daily_task: history.filter((h) => h.category === 'daily_task').length,
      },
      averageComplexity: 0,
      breakdownUsage: history.filter((h) => h.metadata?.hadBreakdown).length,
    };

    return stats;
  } catch (error) {
    console.error('Error getting agent stats:', error);
    return null;
  }
}

