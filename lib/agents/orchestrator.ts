// Main Orchestrator
// Routes queries to appropriate agents and coordinates multi-agent responses

import { groqStructuredOutput, GROQ_MODELS } from '../groq/client';
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
import { retrieveChatHistory } from '../pinecone/chat-history';

/**
 * Detect user intent and determine which agent(s) to route to
 * LLM-driven intent detection with conversation context
 */
export async function detectIntent(
  query: string, 
  conversationHistory?: Array<{role: string, content: string}>
): Promise<IntentDetection> {
  try {
    // Build conversation context for intent detection
    // CRITICAL: Include semantic matches (first few messages) + recent messages (last few)
    const historyContext = conversationHistory && conversationHistory.length > 0
      ? (() => {
          // Semantic matches are at the BEGINNING of the array (by design from API route)
          // We need to determine how many messages are semantic matches
          // For routing, we want: all semantic matches + last 7 chronological
          
          // Estimate: typically 3 conversations × 2 messages = 6 semantic messages
          // But we'll use a heuristic: first 10 messages OR messages until we've seen enough semantic context
          const semanticMessages = conversationHistory.slice(0, 6); // Top 3 conversations (6 messages)
          const chronologicalMessages = conversationHistory.slice(6); // Rest
          const recentMessages = chronologicalMessages.slice(-7); // Last 7 from chronological
          
          // Combine: semantic first (for relevance) + recent (for context)
          const contextForRouting = [...semanticMessages, ...recentMessages];
          
          console.log('🧭 Orchestrator routing context:', {
            totalHistory: conversationHistory.length,
            semanticMessages: semanticMessages.length,
            recentMessages: recentMessages.length,
            contextForRouting: contextForRouting.length,
          });
          
          return `\n\nCONVERSATION CONTEXT FOR ROUTING (${contextForRouting.length} messages):\n${contextForRouting
            .map((msg: any, index: number) => {
              // First 6 are semantic matches
              const isSemanticMatch = index < semanticMessages.length;
              const marker = isSemanticMatch ? '⭐ [RELEVANT] ' : '';
              return `${marker}${msg.role === 'user' ? 'User' : 'Navia'}: ${msg.content}`;
            })
            .join('\n')}\n\n⭐ = Most semantically relevant to current query\n`;
        })()
      : '';

    const prompt = `Analyze this user query and determine routing:

CURRENT QUERY: "${query}"
${historyContext}

CRITICAL: Use the conversation context to understand follow-up questions!
- If user asks "what projects?" after discussing LinkedIn → CAREER domain
- If user asks "tell me more" → Use context to determine domain
- If user asks "how do I do that?" → Refer to previous topic

Intelligently decide:
1. Which domain(s) this query belongs to (finance/career/daily_task)
2. Whether the user would benefit from a breakdown/plan (don't over-do it!)
3. The complexity level of the query

Respond in JSON format following your schema.`;

    const response = await groqStructuredOutput([
      { role: 'system', content: ORCHESTRATOR_INTENT_PROMPT + '\n\nYou must respond in valid JSON format. Always consider conversation context for routing follow-up questions.' },
      { role: 'user', content: prompt },
    ], {
      model: GROQ_MODELS.LLAMA_4_SCOUT // Main model for all agents
    });

    const detection: IntentDetection = JSON.parse(response.message.content || '{}');

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
    // Step 1: Detect intent WITH CONVERSATION CONTEXT
    const intent = await detectIntent(query, userContext?.recentHistory);
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

    // Step 5: If no responses OR all responses have errors, return error
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

    // Check if all responses contain errors
    const allResponsesHaveErrors = responses.every((r) => r.metadata?.error);
    if (allResponsesHaveErrors) {
      return {
        success: false,
        responses,
        metadata: {
          domainsInvolved: intent.domains,
          executionTime: Date.now() - startTime,
          usedBreakdown: false,
          error: 'Agent processing failed',
        },
      };
    }

    // Step 6: Combine responses if multiple agents were used
    const isMultiAgent = responses.length > 1;
    const combinedSummary = isMultiAgent
      ? combineMultiAgentResponses(responses)
      : responses[0].summary;

    // Step 7: Take breakdown from PRIMARY agent only (not all agents!)
    // CRITICAL: Only use the first agent's breakdown to avoid overwhelming users
    const primaryBreakdown = responses.find((r) => r.breakdown && r.breakdown.length > 0)?.breakdown;
    const primaryBreakdownTips = responses.find((r) => r.breakdown && r.breakdown.length > 0)?.breakdownTips;

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
    // TRUST THE LLM'S DECISION - use agent's needsBreakdown flag
    const needsBreakdown = responses.some(
      (r) => r.metadata?.needsBreakdown === true && (!r.breakdown || r.breakdown.length === 0)
    );
    
    const usedBreakdown = !!(primaryBreakdown && primaryBreakdown.length > 0);

    console.log('🎯 Orchestrator decision:', {
      isMultiAgent,
      agentNeedsBreakdown: responses.map(r => ({
        domain: r.domain,
        needsBreakdown: r.metadata?.needsBreakdown,
        hasBreakdown: !!(r.breakdown && r.breakdown.length > 0)
      })),
      primaryBreakdownSteps: primaryBreakdown?.length || 0,
      finalNeedsBreakdown: needsBreakdown,
      usedBreakdown,
    });

    return {
      success: true,
      responses,
      combinedSummary: isMultiAgent ? combinedSummary : undefined,
      breakdown: primaryBreakdown, // Only primary agent's breakdown
      breakdownTips: primaryBreakdownTips, // Tips from primary agent
      resources: allResources.slice(0, 10),
      sources: allSources.slice(0, 8),
      metadata: {
        domainsInvolved: intent.domains,
        executionTime,
        usedBreakdown,
        needsBreakdown, // CRITICAL: Include this for frontend button detection!
        confidence: intent.confidence,
        complexity: intent.complexity,
        multiAgent: isMultiAgent,
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

  // Phrases to remove from individual summaries (they're redundant in multi-agent context)
  const redundantPhrases = [
    /I've created a step-by-step plan below.*?\.?$/gim,
    /I've created a step-by-step plan to help you.*?\.?$/gim,
    /I've created a plan below.*?\.?$/gim,
    /See the step-by-step plan below.*?\.?$/gim,
  ];

  const sections = responses
    .map((response) => {
      const label = domainLabels[response.domain];
      // Strip out mentions of "step-by-step plan" from individual summaries
      let cleanedSummary = response.summary;
      redundantPhrases.forEach(phrase => {
        cleanedSummary = cleanedSummary.replace(phrase, '').trim();
      });
      
      return `${label}:\n${cleanedSummary}`;
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

