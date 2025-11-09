// Daily Task Agent
// Specialized agent for executive function, task management, and productivity

import { groqStructuredOutput } from '../groq/client';
import { DAILY_TASK_AGENT_PROMPT } from './prompts';
import { AgentContext, AIResponse, ResourceLink, SourceReference } from './types';
import { retrieveTaskSources } from '../pinecone/rag';
import { retrieveRelevantContext } from '../pinecone/chat-history';
import { searchProductivityResources, searchNeurodivergentResources } from '../tools/tavily';
import { generateBreakdown, analyzeTaskComplexity, explicitlyRequestsBreakdown } from './breakdown';

/**
 * Process a daily task/executive function query
 */
export async function processDailyTaskQuery(
  context: AgentContext
): Promise<AIResponse> {
  try {
    const { userId, query, userContext } = context;

    // Step 1: Retrieve relevant knowledge from Pinecone
    const ragSources = await retrieveTaskSources(query, 5);

    // Step 2: Retrieve relevant past conversations
    const chatHistory = await retrieveRelevantContext(userId, query, 'daily_task', 3);

    // Step 3: Fetch productivity and neurodivergent-friendly resources
    const externalResources = await fetchRelevantTaskResources(query);

    // Step 4: Build context for LLM
    const ragContext = ragSources.length > 0
      ? `\n\nRELEVANT KNOWLEDGE FROM DATABASE:\n${ragSources
          .map((s) => `- ${s.title}: ${s.content}`)
          .join('\n')}`
      : '';

    const historyContext = chatHistory.length > 0
      ? `\n\nRELEVANT PAST CONVERSATIONS:\n${chatHistory
          .map((h) => `- User asked: "${h.message.substring(0, 100)}..."\n  Response: "${h.response.substring(0, 100)}..."`)
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

    // Step 5: Check if user EXPLICITLY requested a breakdown
    const explicitBreakdownRequest = explicitlyRequestsBreakdown(query);

    // Step 6: Generate breakdown ONLY if explicitly requested
    let breakdown: string[] | undefined;
    if (explicitBreakdownRequest) {
      console.log('🎯 Daily Task: User explicitly requested breakdown, generating...');
      const breakdownResult = await generateBreakdown({
        task: query,
        context: 'Daily task/executive function',
        userEFProfile: userContext?.ef_profile,
      });
      breakdown = breakdownResult.breakdown;
    }

    // Step 7: Analyze complexity for metadata
    // If breakdown was already generated (explicit request), set needsBreakdown to false
    // Otherwise, use complexity analysis to determine if we should suggest it (lower threshold for daily tasks: >= 3)
    const complexityAnalysis = await analyzeTaskComplexity(query);
    const needsBreakdown = breakdown && breakdown.length > 0 
      ? false  // Breakdown already provided, no need to suggest
      : (complexityAnalysis.complexity >= 3 || complexityAnalysis.needsBreakdown); // Suggest breakdown if complex but not explicitly requested

    // Step 8: Adjust for energy level
    const energyAdjustment = userContext?.energy_level === 'low'
      ? '\n\nIMPORTANT: User has LOW ENERGY. Provide SIMPLE, MINIMAL steps. Prioritize rest and self-compassion.'
      : userContext?.energy_level === 'high'
      ? '\n\nUser has HIGH ENERGY. Can handle more detailed guidance.'
      : '';

    // Step 9: Build breakdown context if generated
    const breakdownContext = breakdown && breakdown.length > 0
      ? `\n\n✅ STEP-BY-STEP PLAN GENERATED:\n${breakdown.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nCRITICAL INSTRUCTIONS:
- Include the breakdown steps in the "breakdown" field of your JSON response (copy them exactly from above)
- In your summary text: Simply mention that you've created a step-by-step plan (e.g., "I've created a step-by-step plan below to help you")
- DO NOT list or repeat the steps in your summary text - they will be displayed separately
- Keep your summary concise and focused on the answer to their question`
      : '';

    // Step 10: Generate AI response
    const prompt = `${DAILY_TASK_AGENT_PROMPT}

USER QUERY: "${query}"
${userContextInfo}
${energyAdjustment}
${ragContext}
${historyContext}
${resourceContext}
${breakdownContext}

Provide a warm, supportive response following the JSON format specified in your system prompt.
Complexity: ${complexityAnalysis.complexity}/10
Needs Breakdown: ${needsBreakdown}

Remember: If a breakdown was provided above, include it in the "breakdown" field but DO NOT duplicate the steps in your summary text. Just mention that a plan was created.
This user may be struggling. Be extra gentle and validating.

Respond in JSON format following your schema.`;

    const response = await groqStructuredOutput([
      { role: 'system', content: DAILY_TASK_AGENT_PROMPT + '\n\nYou must respond in valid JSON format.' },
      { role: 'user', content: prompt },
    ]);

    const aiResponse: AIResponse = JSON.parse(response.message.content || '{}');

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
    
    console.log('🔍 Daily Task agent response:', {
      hasPreGeneratedBreakdown: !!breakdown,
      breakdownLength: breakdown?.length || 0,
      finalBreakdown: finalBreakdown?.length || 0,
      needsBreakdown,
      complexity: complexityAnalysis.complexity,
      energyLevel: userContext?.energy_level,
    });
    
    // Build response object - ONLY include breakdown if it exists and has items
    const finalResponse: AIResponse = {
      domain: 'daily_task',
      summary: aiResponse.summary || 'Here\'s some support for your task.',
      resources: resources.slice(0, 8), // Limit to top 8 resources
      sources: sources.slice(0, 5), // Limit to top 5 sources
      metadata: {
        confidence: aiResponse.metadata?.confidence || 0.8,
        complexity: complexityAnalysis.complexity,
        needsBreakdown,
        suggestedActions: aiResponse.metadata?.suggestedActions || [],
        retrievedFromRAG: ragSources.length,
        externalResourcesFound: externalResources.length,
        energyLevel: userContext?.energy_level,
      },
    };
    
    // Only add breakdown if it exists and has content
    if (finalBreakdown && finalBreakdown.length > 0) {
      finalResponse.breakdown = finalBreakdown;
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

