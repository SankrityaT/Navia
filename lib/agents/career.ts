// Career Agent
// Specialized agent for job search, career development, and workplace accommodations

import { groqStructuredOutput, GROQ_MODELS } from '../groq/client';
import { CAREER_AGENT_PROMPT } from './prompts';
import { AgentContext, AIResponse, ResourceLink, SourceReference } from './types';
import { retrieveCareerSources } from '../pinecone/rag';
// Chat history now comes via userContext.recentHistory from API route
import {
  searchCareerResources,
  searchJobs,
  getResumeHelp,
  getInterviewPrep,
  getWorkplaceAccommodations,
  getCareerTransitionAdvice,
  getNetworkingTips,
} from '../tools/career-tools';
import { generateBreakdown, analyzeTaskComplexity, explicitlyRequestsBreakdown } from './breakdown';

/**
 * Process a career-related query
 * LLM-driven decision making - no explicit greeting checks
 */
export async function processCareerQuery(
  context: AgentContext
): Promise<AIResponse> {
  try {
    const { userId, query, userContext } = context;

    // Step 1: Retrieve relevant knowledge from Pinecone
    const ragSources = await retrieveCareerSources(query, 5);
    
    // Step 2: Determine specific career topic and fetch external resources
    const externalResources = await fetchRelevantCareerResources(query);
    
    // Note: Chat history is now passed via userContext.recentHistory from API route
    // (domain-filtered, top 3 semantic + rest chronological)

    // Step 5: Build context for LLM
    
    // CRITICAL: Full conversation history with CLEAR section divisions
    const sessionCount = userContext?.sessionMessageCount || 0;
    const semanticStartIndex = sessionCount;
    const semanticEndIndex = sessionCount + (userContext?.semanticMatchMessageCount || 0);
    const totalHistoryLength = userContext?.recentHistory?.length || 0;
    
    const recentConversationContext = userContext?.recentHistory && userContext.recentHistory.length > 0
      ? `\n\n### CONVERSATION HISTORY (${userContext.fullHistoryCount || 0} stored conversations + ${sessionCount} current session messages):

` + (sessionCount > 0 
        ? `--- 🔥 CURRENT SESSION (${sessionCount} messages) ---
[MOST IMPORTANT: This is the ONGOING conversation - use this to understand follow-up questions like "tell me more", "is it good?", etc.]
${userContext.recentHistory.slice(0, sessionCount).map((msg: any) => {
  return `${msg.role === 'user' ? 'User' : 'Navia'}: ${msg.content}`;
}).join('\n')}
--- END CURRENT SESSION ---

` : '') + (semanticEndIndex > semanticStartIndex 
        ? `--- ⭐ SEMANTICALLY RELEVANT PAST CONVERSATIONS (${semanticEndIndex - semanticStartIndex} messages) ---
[RELEVANT: These past conversations are semantically similar to the current query]
${userContext.recentHistory.slice(semanticStartIndex, semanticEndIndex).map((msg: any) => {
  return `${msg.role === 'user' ? 'User' : 'Navia'}: ${msg.content}`;
}).join('\n')}
--- END SEMANTIC MATCHES ---

` : '') + (totalHistoryLength > semanticEndIndex 
        ? `--- 📋 CHRONOLOGICAL HISTORY (${totalHistoryLength - semanticEndIndex} messages) ---
[CONTEXT: Recent past conversations for general context]
${userContext.recentHistory.slice(semanticEndIndex).map((msg: any) => {
  return `${msg.role === 'user' ? 'User' : 'Navia'}: ${msg.content}`;
}).join('\n')}
--- END CHRONOLOGICAL HISTORY ---
` : '') + `\n### END OF CONVERSATION HISTORY\n`
      : '';
    
    const ragContext = ragSources.length > 0
      ? `\n\nRELEVANT KNOWLEDGE FROM DATABASE:\n${ragSources
          .map((s) => `- ${s.title}: ${s.content}`)
          .join('\n')}`
      : '';

    const resourceContext = externalResources.length > 0
      ? `\n\nEXTERNAL RESOURCES FOUND:\n${externalResources
          .map((r) => `- ${r.title}: ${r.description || r.content || 'Resource available'}`)
          .join('\n')}`
      : '';

    const userContextInfo = userContext
      ? `\n\nUSER CONTEXT:\n- Energy Level: ${userContext.energy_level || 'unknown'}\n- EF Profile: ${userContext.ef_profile?.join(', ') || 'not provided'}\n- Goals: ${userContext.current_goals?.join(', ') || 'not provided'}`
      : '';

    // Step 6: Check if user EXPLICITLY requested a breakdown (with conversation history for context)
    const explicitBreakdownRequest = await explicitlyRequestsBreakdown(query, userContext?.recentHistory);

    // Step 7: Generate breakdown ONLY if explicitly requested
    let breakdown: any[] | undefined;
    let breakdownTips: string[] | undefined;
    if (explicitBreakdownRequest) {
      console.log('🎯 Career: User explicitly requested breakdown, generating...');
      const breakdownResult = await generateBreakdown({
        task: query,
        context: 'Career task',
        userEFProfile: userContext?.ef_profile,
      }, userContext?.recentHistory); // Pass conversation history!
      breakdown = breakdownResult.breakdown;
      breakdownTips = breakdownResult.tips;
    }

    // Step 8: Analyze complexity for metadata (only for logging/context)
    const complexityAnalysis = await analyzeTaskComplexity(query);
    
    // Important: If breakdown was already generated, we'll set needsBreakdown to false
    // Otherwise, we'll let the LLM decide by passing complexity to it
    // The LLM will return needsBreakdown in its response metadata

    // Step 8: Build breakdown context if generated
    const breakdownContext = breakdown && breakdown.length > 0
      ? `\n\n✅ STEP-BY-STEP PLAN GENERATED (${breakdown.length} main steps):\n${breakdown.map((step: any, i: number) => {
          const stepText = `${i + 1}. ${step.title || step}`;
          if (typeof step === 'object' && step.subSteps && step.subSteps.length > 0) {
            return stepText + '\n   ' + step.subSteps.map((sub: string) => `- ${sub}`).join('\n   ');
          }
          return stepText;
        }).join('\n')}\n\nCRITICAL INSTRUCTIONS:
- Include the breakdown in your JSON response using the EXACT format from the system prompt (with title, subSteps, etc.)
- In your summary text: Simply mention "I've created a step-by-step plan below to help you"
- DO NOT list or repeat the steps in your summary text - they will be displayed separately
- Keep your summary concise and focused on the answer to their question`
      : '';

    // Step 9: Generate AI response
    const prompt = `${CAREER_AGENT_PROMPT}
${recentConversationContext}
USER QUERY: "${query}"
${userContextInfo}
${ragContext}
${resourceContext}
${breakdownContext}

Provide a helpful, structured response following the JSON format specified in your system prompt.

Task Complexity: ${complexityAnalysis.complexity}/10
${breakdown && breakdown.length > 0 ? 'Breakdown already generated and provided above.' : 'No breakdown generated yet - YOU decide if needsBreakdown should be true.'}

Remember: 
- If a breakdown was provided above, include it in the "breakdown" field and set needsBreakdown: false
- If NO breakdown above BUT task would benefit, answer normally and set needsBreakdown: true
- DO NOT ask about breakdown in summary - the UI will show a button

Respond in JSON format following your schema.`;

    const response = await groqStructuredOutput([
      { role: 'system', content: CAREER_AGENT_PROMPT + '\n\nYou must respond in valid JSON format.' },
      { role: 'user', content: prompt },
    ], {
      model: GROQ_MODELS.LLAMA_4_SCOUT // Main model for all agents
    });

    const aiResponse: AIResponse = JSON.parse(response.message.content || '{}');

    // Step 10: Determine final needsBreakdown and showResources values
    // PRIORITY ORDER:
    // 1. If breakdown was pre-generated → false (already provided)
    // 2. Otherwise → trust LLM's intelligent decision
    const finalNeedsBreakdown = breakdown && breakdown.length > 0 
        ? false  // Breakdown already provided
      : (aiResponse.metadata?.needsBreakdown ?? false); // Use LLM's intelligent decision

    // Trust LLM's intelligent decision on whether to show resources
    const shouldShowResources = aiResponse.metadata?.showResources ?? true;

    console.log('🤖 Career LLM decision:', {
      query: query.substring(0, 50),
      llmNeedsBreakdown: aiResponse.metadata?.needsBreakdown,
      llmShowResources: aiResponse.metadata?.showResources,
      hasPreGeneratedBreakdown: !!breakdown,
      finalNeedsBreakdown,
      shouldShowResources,
      complexity: complexityAnalysis.complexity,
    });

    // Step 11: Enhance response with retrieved data
    const sources: SourceReference[] = ragSources.map((s) => ({
      title: s.title || 'Untitled',
      url: s.url || '',
      excerpt: s.content ? s.content.substring(0, 200) : '',
      relevance: s.score || 0,
    }));

    const resources: ResourceLink[] = externalResources.map((r) => ({
      title: r.title || 'Resource',
      url: r.url || '',
      description: r.description || r.content || '',
      type: categorizeResourceType(r.category),
    }));

    // Merge with AI-generated resources
      if (aiResponse.resources) {
        resources.push(...aiResponse.resources);
      }
      if (aiResponse.sources) {
        sources.push(...aiResponse.sources);
    }

    // Step 11: Return complete response with breakdown
    // ALWAYS prioritize pre-generated breakdown (ignore LLM's breakdown to avoid duplication)
    const finalBreakdown = breakdown && breakdown.length > 0 
      ? breakdown  // Use pre-generated breakdown
      : undefined; // Don't use LLM's breakdown - it might duplicate steps in summary
    
    console.log('🔍 Career agent final response:', {
      hasPreGeneratedBreakdown: !!breakdown,
      breakdownLength: breakdown?.length || 0,
      finalBreakdown: finalBreakdown?.length || 0,
      finalNeedsBreakdown,
      complexity: complexityAnalysis.complexity,
    });
    
    // Build response object - ONLY include resources if LLM says showResources: true
    const finalResponse: AIResponse = {
      domain: 'career',
      summary: aiResponse.summary || 'Here\'s guidance on your career question.',
      resources: shouldShowResources ? resources.slice(0, 8) : [], // LLM decides!
      sources: shouldShowResources ? sources.slice(0, 5) : [], // LLM decides!
      metadata: {
        confidence: aiResponse.metadata?.confidence || 0.8,
        complexity: complexityAnalysis.complexity,
        needsBreakdown: finalNeedsBreakdown, // Use calculated value
        showResources: shouldShowResources, // Pass through LLM's decision
        suggestedActions: aiResponse.metadata?.suggestedActions || [],
        retrievedFromRAG: ragSources.length,
        externalResourcesFound: externalResources.length,
      },
    };
    
    // Only add breakdown if it exists and has content
    if (finalBreakdown && finalBreakdown.length > 0) {
      finalResponse.breakdown = finalBreakdown;
      if (breakdownTips && breakdownTips.length > 0) {
        finalResponse.breakdownTips = breakdownTips;
      }
    }
    
    return finalResponse;
  } catch (error) {
    console.error('Career agent error:', error);
    
    return {
      domain: 'career',
      summary: 'I encountered an issue processing your career question. Please try rephrasing or asking a more specific question about job searching, resumes, or workplace topics.',
      metadata: {
        confidence: 0.3,
        error: 'Processing error',
      },
    };
  }
}

/**
 * Fetch relevant external career resources based on query topic
 * Always includes web search for real-time information
 */
async function fetchRelevantCareerResources(query: string): Promise<any[]> {
  const lowerQuery = query.toLowerCase();
  const resources: any[] = [];

  try {
    // ALWAYS do web search first for real-time sources (like finance agent)
    console.log('🔍 Searching web for career resources...');
    const webResults = await searchCareerResources(query);
    resources.push(...webResults);
    console.log(`✅ Found ${webResults.length} web results`);

    // Resume queries - add specific tools
    if (lowerQuery.includes('resume') || lowerQuery.includes('cv')) {
      const resumeHelp = await getResumeHelp();
      resources.push(...resumeHelp);
    }

    // Interview queries
    if (lowerQuery.includes('interview')) {
      const interviewPrep = await getInterviewPrep();
      resources.push(...interviewPrep);
    }

    // Accommodation queries
    if (lowerQuery.includes('accommodation') || lowerQuery.includes('disability') || lowerQuery.includes('ada')) {
      const accommodations = await getWorkplaceAccommodations();
      resources.push(...accommodations);
    }

    // Job search queries
    if (lowerQuery.includes('job') || lowerQuery.includes('hiring') || lowerQuery.includes('apply')) {
      const jobs = await searchJobs(query);
      resources.push(...jobs);
    }

    // Career transition
    if (lowerQuery.includes('transition') || lowerQuery.includes('change career') || lowerQuery.includes('switch')) {
      const careerAdvice = await searchCareerResources(query, 'career_advice');
      resources.push(...careerAdvice);
    }

    // Networking queries
    if (lowerQuery.includes('network') || lowerQuery.includes('linkedin') || lowerQuery.includes('connect')) {
      const networkingTips = await getNetworkingTips();
      resources.push(...networkingTips);
    }

    return resources.slice(0, 8); // Return more resources (matching finance agent)
  } catch (error) {
    console.error('Error fetching career resources:', error);
    return [];
  }
}

/**
 * Detect specific career sub-topics
 */
export function detectCareerSubTopic(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('resume') || lowerQuery.includes('cv')) return 'resume';
  if (lowerQuery.includes('interview')) return 'interview';
  if (lowerQuery.includes('accommodation')) return 'accommodations';
  if (lowerQuery.includes('job') || lowerQuery.includes('apply')) return 'job_search';
  if (lowerQuery.includes('network')) return 'networking';
  if (lowerQuery.includes('transition') || lowerQuery.includes('change')) return 'career_transition';

  return 'general';
}

/**
 * Map career category to resource type
 */
function categorizeResourceType(category: string): 'article' | 'tool' | 'guide' | 'template' | 'video' {
  switch (category) {
    case 'resume':
      return 'template';
    case 'accommodations':
      return 'guide';
    case 'job_search':
      return 'tool';
    default:
      return 'article';
  }
}

