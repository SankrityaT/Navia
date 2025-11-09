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
  conversationHistory?: Array<{role: string, content: string}>,
  sessionMessageCount?: number
): Promise<IntentDetection> {
  try {
    // Build conversation context for intent detection
    // CRITICAL: For follow-up detection, ONLY use session messages (ignore semantic matches from Pinecone)!
    const historyContext = conversationHistory && conversationHistory.length > 0
      ? (() => {
          // Smart follow-up detection based on conversation structure (no hardcoded keywords!)
          // A query is likely a follow-up if:
          // 1. There's an active session (sessionMessageCount > 0)
          // 2. The query is short/conversational (< 10 words)
          // 3. There are recent messages to refer to
          
          const queryWordCount = query.trim().split(/\s+/).length;
          const hasActiveSession = sessionMessageCount && sessionMessageCount > 0;
          const isShortQuery = queryWordCount <= 10;
          
          // If short query + active session, likely a follow-up → prioritize session context
          const likelyFollowUp = hasActiveSession && isShortQuery;
          
          // For likely follow-ups: ONLY use session messages (ignore semantic matches from old convos)
          // For longer/new queries: Use session + semantic context for better understanding
          const messagesToUse = likelyFollowUp 
            ? (sessionMessageCount || 6) // Only current session!
            : Math.min(12, conversationHistory.length); // Session + some semantic/historical
          
          const recentMessages = conversationHistory.slice(0, messagesToUse);
          
          console.log('🧭 Orchestrator routing context:', {
            totalHistory: conversationHistory.length,
            sessionMessageCount: sessionMessageCount || 'unknown',
            queryWordCount,
            likelyFollowUp,
            messagesToUse,
            recentForRouting: recentMessages.length,
          });
          
          // Format with HEAVY emphasis on the most recent exchange
          let contextStr = '\n\n=== CONVERSATION HISTORY FOR ROUTING ===\n\n';
          
          if (likelyFollowUp) {
            contextStr += '⚠️ LIKELY FOLLOW-UP (short query + active session) - Using ONLY current session context (ignoring old conversations)\n\n';
          }
          
          // Highlight the MOST RECENT exchange (critical for follow-ups!)
          if (recentMessages.length >= 2) {
            contextStr += '🔥 MOST RECENT EXCHANGE (CRITICAL FOR FOLLOW-UPS):\n';
            contextStr += `User: ${recentMessages[0].content}\n`;
            contextStr += `Navia: ${recentMessages[1].content}\n\n`;
            
            // Include a few more for context if available
            if (recentMessages.length > 2) {
              contextStr += '📋 Previous context (for reference):\n';
              for (let i = 2; i < recentMessages.length; i++) {
                const msg = recentMessages[i];
                contextStr += `${msg.role === 'user' ? 'User' : 'Navia'}: ${msg.content}\n`;
              }
            }
          } else if (recentMessages.length > 0) {
            contextStr += 'Recent messages:\n';
            recentMessages.forEach((msg: any) => {
              contextStr += `${msg.role === 'user' ? 'User' : 'Navia'}: ${msg.content}\n`;
            });
          }
          
          contextStr += '\n=== END CONVERSATION HISTORY ===\n';
          return contextStr;
        })()
      : '';

    const prompt = `Analyze this user query and determine routing:

🎯 CURRENT QUERY: "${query}"
${historyContext}

🚨 CRITICAL INSTRUCTIONS FOR FOLLOW-UP QUESTIONS:
1. If the query is SHORT (<8 words) or uses words like "which", "that", "it", "them", "more" → CHECK THE MOST RECENT EXCHANGE!
2. Maintain domain continuity unless user explicitly changes topics
3. Examples of follow-ups that should STAY in the same domain:
   - "Which one do you suggest?" after discussing career topics → CAREER
   - "What about that?" after discussing budgets → FINANCE
   - "Tell me more" → Use the previous domain
   - "Is it good?" → Stay in current domain

4. ONLY switch domains if user introduces NEW keywords (e.g., "Now about my budget..." when previously discussing career)

Your decision:
1. Which domain(s) this query belongs to (finance/career/daily_task)
2. Whether the user would benefit from a breakdown/plan (don't over-do it!)
3. The complexity level of the query
4. Include reasoning that explains if this is a follow-up and which domain you're maintaining

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
    // Pass sessionMessageCount so orchestrator knows where session ends and semantic history begins
    const intent = await detectIntent(query, userContext?.recentHistory, userContext?.sessionMessageCount);
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

