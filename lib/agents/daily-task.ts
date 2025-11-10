// Daily Task Agent
// Specialized agent for executive function, task management, and productivity

import { groqStructuredOutput, GROQ_MODELS } from '../groq/client';
import { DAILY_TASK_AGENT_PROMPT } from './prompts';
import { AgentContext, AIResponse, ResourceLink, SourceReference } from './types';
import { retrieveTaskSources } from '../pinecone/rag';
// Chat history now comes via userContext.recentHistory from API route
import { searchProductivityResources, searchNeurodivergentResources } from '../tools/tavily';
import { generateBreakdown, analyzeTaskComplexity, explicitlyRequestsBreakdown } from './breakdown';

/**
 * Process a daily task/executive function query
 * LLM-driven decision making - no explicit greeting checks
 */
export async function processDailyTaskQuery(
  context: AgentContext
): Promise<AIResponse> {
  try {
    const { userId, query, userContext } = context;

    // Step 1: Retrieve relevant knowledge from Pinecone
    const ragSources = await retrieveTaskSources(query, 5);
    
    // Step 2: Fetch productivity and neurodivergent-friendly resources
    const externalResources = await fetchRelevantTaskResources(query);
    
    // Note: Chat history is now passed via userContext.recentHistory from API route
    // (domain-filtered, top 3 semantic + rest chronological)

    // Step 5: Build context for LLM
    
    // CRITICAL: Full conversation history with CLEAR section divisions
    const sessionCount = userContext?.sessionMessageCount || 0;
    const semanticStartIndex = sessionCount;
    const semanticEndIndex = sessionCount + (userContext?.semanticMatchMessageCount || 0);
    const totalHistoryLength = userContext?.recentHistory?.length || 0;
    
    // Check if this is a follow-up and get recent questions
    const isLikelyFollowUp = userContext?.isLikelyFollowUp || false;
    const recentQuestions = userContext?.recentQuestions || [];
    
    const recentConversationContext = userContext?.recentHistory && userContext.recentHistory.length > 0
      ? `\n\n### CONVERSATION HISTORY (${userContext.fullHistoryCount || 0} stored conversations + ${sessionCount} current session messages):

` + (isLikelyFollowUp && recentQuestions.length > 0
        ? `🔥🔥🔥 MOST RECENT QUESTIONS (ANSWER THIS FOLLOW-UP BASED ON THESE EXACT QUESTIONS) 🔥🔥🔥
[CRITICAL: The current query is a follow-up. Answer based on the MOST RECENT questions shown below, NOT earlier context.
If the follow-up uses pronouns like "these", "that", "it", refer to the immediately preceding assistant response.
Maintain topic continuity: if the last question was about documents, answer about documents.]
${recentQuestions.map((msg: any) => {
  return `${msg.role === 'user' ? 'User' : 'Navia'}: ${msg.content}`;
}).join('\n')}
--- END MOST RECENT QUESTIONS ---

` : '') + (sessionCount > 0 
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
          .map((r) => `- ${r.title}: ${r.content ? r.content.substring(0, 150) : ''}`)
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
      console.log('🎯 Daily Task: User explicitly requested breakdown, generating...');
      const breakdownResult = await generateBreakdown({
        task: query,
        context: 'Daily task/executive function',
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

    // Step 9: Adjust for energy level
    const energyAdjustment = userContext?.energy_level === 'low'
      ? '\n\nIMPORTANT: User has LOW ENERGY. Provide SIMPLE, MINIMAL steps. Prioritize rest and self-compassion.'
      : userContext?.energy_level === 'high'
      ? '\n\nUser has HIGH ENERGY. Can handle more detailed guidance.'
      : '';

    // Step 9: Build breakdown context if generated
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

    // Step 10: Generate AI response
    const prompt = `${DAILY_TASK_AGENT_PROMPT}
${recentConversationContext}
USER QUERY: "${query}"
${userContextInfo}
${energyAdjustment}
${ragContext}
${resourceContext}
${breakdownContext}

Provide a warm, supportive response following the JSON format specified in your system prompt.

Task Complexity: ${complexityAnalysis.complexity}/10
${breakdown && breakdown.length > 0 ? 'Breakdown already generated and provided above.' : 'No breakdown generated yet - YOU decide if needsBreakdown should be true.'}

Remember: 
- If a breakdown was provided above, include it in the "breakdown" field and set needsBreakdown: false
- If NO breakdown above BUT task would benefit, answer normally and set needsBreakdown: true
- DO NOT ask about breakdown in summary - the UI will show a button
This user may be struggling. Be extra gentle and validating.

Respond in JSON format following your schema.`;

    const response = await groqStructuredOutput([
      { role: 'system', content: DAILY_TASK_AGENT_PROMPT + '\n\nYou must respond in valid JSON format.' },
      { role: 'user', content: prompt },
    ], {
      model: GROQ_MODELS.LLAMA_4_SCOUT // Main model for all agents
    });

    const aiResponse: AIResponse = JSON.parse(response.message.content || '{}');

    // Step 11: Determine final needsBreakdown and showResources values
    // PRIORITY ORDER:
    // 1. If breakdown was pre-generated → false (already provided)
    // 2. Otherwise → trust LLM's intelligent decision
    const finalNeedsBreakdown = breakdown && breakdown.length > 0 
        ? false  // Breakdown already provided
      : (aiResponse.metadata?.needsBreakdown ?? false); // Use LLM's intelligent decision

    // Trust LLM's intelligent decision on whether to show resources
    const shouldShowResources = aiResponse.metadata?.showResources ?? true;

    console.log('🤖 Daily Task LLM decision:', {
      query: query.substring(0, 50),
      llmNeedsBreakdown: aiResponse.metadata?.needsBreakdown,
      llmShowResources: aiResponse.metadata?.showResources,
      hasPreGeneratedBreakdown: !!breakdown,
      finalNeedsBreakdown,
      shouldShowResources,
      complexity: complexityAnalysis.complexity,
    });

    // Step 12: Enhance response with retrieved data
    const sources: SourceReference[] = ragSources.map((s) => ({
      title: s.title || 'Untitled',
      url: s.url || '',
      excerpt: s.content ? s.content.substring(0, 200) : '',
      relevance: s.score || 0,
    }));

    // Build resources array
    const resources: ResourceLink[] = externalResources.map((r) => ({
      title: r.title || 'Resource',
      url: r.url || '',
      description: r.content ? r.content.substring(0, 200) : '',
      type: 'article',
    }));

    // Add productivity tool recommendations
      const productivityTools = getProductivityToolRecommendations(query, userContext?.ef_profile);
      resources.push(...productivityTools);

    // Merge with AI-generated resources
      if (aiResponse.resources) {
        resources.push(...aiResponse.resources);
      }
      if (aiResponse.sources) {
        sources.push(...aiResponse.sources);
    }

    // Step 12: Return complete response with breakdown
    // ALWAYS prioritize pre-generated breakdown (ignore LLM's breakdown to avoid duplication)
    const finalBreakdown = breakdown && breakdown.length > 0 
      ? breakdown  // Use pre-generated breakdown
      : undefined; // Don't use LLM's breakdown - it might duplicate steps in summary
    
    console.log('🔍 Daily Task agent final response:', {
      hasPreGeneratedBreakdown: !!breakdown,
      breakdownLength: breakdown?.length || 0,
      finalBreakdown: finalBreakdown?.length || 0,
      finalNeedsBreakdown,
      complexity: complexityAnalysis.complexity,
      energyLevel: userContext?.energy_level,
    });
    
    // Build response object - ONLY include resources if LLM says showResources: true
    const finalResponse: AIResponse = {
      domain: 'daily_task',
      summary: aiResponse.summary || 'Here\'s some support for your task.',
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
        energyLevel: userContext?.energy_level,
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
    console.error('Daily task agent error:', error);
    
    return {
      domain: 'daily_task',
      summary: 'I encountered an issue processing your question. That\'s okay - sometimes technology has its own executive function challenges! Please try rephrasing your question about tasks, organization, or productivity.',
      metadata: {
        confidence: 0.3,
        error: 'Processing error',
      },
    };
  }
}

/**
 * Fetch relevant task management and productivity resources
 * Always includes web search for real-time information
 */
async function fetchRelevantTaskResources(query: string): Promise<any[]> {
  const resources: any[] = [];
  
  try {
    const lowerQuery = query.toLowerCase();

    // ALWAYS do web search first for real-time sources (like finance agent)
    console.log('🔍 Searching web for productivity/task resources...');
    
    // Check if it's a neurodivergent-specific query
    const isNeurodivergentFocus = 
      lowerQuery.includes('adhd') ||
      lowerQuery.includes('autism') ||
      lowerQuery.includes('neurodivergent') ||
      lowerQuery.includes('executive function');

    if (isNeurodivergentFocus) {
      const neurodivergentResults = await searchNeurodivergentResources(query);
      resources.push(...neurodivergentResults);
      console.log(`✅ Found ${neurodivergentResults.length} neurodivergent-focused results`);
    } else {
      const productivityResults = await searchProductivityResources(query);
      resources.push(...productivityResults);
      console.log(`✅ Found ${productivityResults.length} productivity results`);
    }

    return resources.slice(0, 8); // Return more resources (matching finance agent)
  } catch (error) {
    console.error('Error fetching task resources:', error);
    return [];
  }
}

/**
 * Get productivity tool recommendations based on query and EF profile
 */
function getProductivityToolRecommendations(
  query: string,
  efProfile?: string[]
): ResourceLink[] {
  const tools: ResourceLink[] = [];
  const lowerQuery = query.toLowerCase();

  // Timer/Focus tools
  if (lowerQuery.includes('focus') || lowerQuery.includes('concentrate') || lowerQuery.includes('distract')) {
    tools.push({
      title: 'Forest App',
      url: 'https://www.forestapp.cc/',
      description: 'Gamified focus timer that grows virtual trees while you work. Great for ADHD.',
      type: 'tool',
    });
    tools.push({
      title: 'Focusmate',
      url: 'https://www.focusmate.com/',
      description: 'Virtual body doubling sessions. Work alongside others in 50-minute blocks.',
      type: 'tool',
    });
  }

  // Task management
  if (lowerQuery.includes('organize') || lowerQuery.includes('task') || lowerQuery.includes('plan')) {
    tools.push({
      title: 'Goblin Tools',
      url: 'https://goblin.tools/',
      description: 'Free suite of tools for neurodivergent people: task breakdown, emotion check, judgment-free todo lists.',
      type: 'tool',
    });
    tools.push({
      title: 'Todoist',
      url: 'https://todoist.com/',
      description: 'Clean task manager with natural language input. Low cognitive load.',
      type: 'tool',
    });
  }

  // Time management
  if (lowerQuery.includes('time') || lowerQuery.includes('schedule') || lowerQuery.includes('routine')) {
    tools.push({
      title: 'Tiimo',
      url: 'https://www.tiimoapp.com/',
      description: 'Visual daily planner designed specifically for neurodivergent users with icons and reminders.',
      type: 'tool',
    });
  }

  // Executive function challenges
  if (efProfile?.includes('task_initiation') || lowerQuery.includes('start') || lowerQuery.includes('stuck')) {
    tools.push({
      title: '5-Minute Rule Timer',
      url: 'https://pomofocus.io/',
      description: 'Simple Pomodoro timer. Just commit to 5 minutes to overcome task initiation.',
      type: 'tool',
    });
  }

  return tools;
}

/**
 * Detect specific task management sub-topics
 */
export function detectTaskSubTopic(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('focus') || lowerQuery.includes('concentrate')) return 'focus';
  if (lowerQuery.includes('organize') || lowerQuery.includes('clutter')) return 'organization';
  if (lowerQuery.includes('time') || lowerQuery.includes('schedule')) return 'time_management';
  if (lowerQuery.includes('routine') || lowerQuery.includes('habit')) return 'routines';
  if (lowerQuery.includes('start') || lowerQuery.includes('stuck') || lowerQuery.includes('procrastinat')) return 'task_initiation';
  if (lowerQuery.includes('overwhelm') || lowerQuery.includes('burnout')) return 'overwhelm';

  return 'general';
}

