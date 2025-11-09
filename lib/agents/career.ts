// Career Agent
// Specialized agent for job search, career development, and workplace accommodations

import { groqStructuredOutput } from '../groq/client';
import { CAREER_AGENT_PROMPT } from './prompts';
import { AgentContext, AIResponse, ResourceLink, SourceReference } from './types';
import { retrieveCareerSources } from '../pinecone/rag';
import { retrieveRelevantContext } from '../pinecone/chat-history';
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
 */
export async function processCareerQuery(
  context: AgentContext
): Promise<AIResponse> {
  try {
    const { userId, query, userContext } = context;

    // Step 1: Retrieve relevant knowledge from Pinecone
    const ragSources = await retrieveCareerSources(query, 5);

    // Step 2: Retrieve relevant past conversations
    const chatHistory = await retrieveRelevantContext(userId, query, 'career', 3);

    // Step 3: Determine specific career topic and fetch external resources
    const externalResources = await fetchRelevantCareerResources(query);

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
          .map((r) => `- ${r.title}: ${r.description || r.content || 'Resource available'}`)
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
      console.log('🎯 Career: User explicitly requested breakdown, generating...');
      const breakdownResult = await generateBreakdown({
        task: query,
        context: 'Career task',
        userEFProfile: userContext?.ef_profile,
      });
      breakdown = breakdownResult.breakdown;
    }

    // Step 7: Analyze complexity for metadata
    // If breakdown was already generated (explicit request), set needsBreakdown to false
    // Otherwise, use complexity analysis to determine if we should suggest it
    const complexityAnalysis = await analyzeTaskComplexity(query);
    const needsBreakdown = breakdown && breakdown.length > 0 
      ? false  // Breakdown already provided, no need to suggest
      : complexityAnalysis.needsBreakdown; // Suggest breakdown if complex but not explicitly requested

    // Step 8: Build breakdown context if generated
    const breakdownContext = breakdown && breakdown.length > 0
      ? `\n\n✅ STEP-BY-STEP PLAN GENERATED:\n${breakdown.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nCRITICAL INSTRUCTIONS:
- Include the breakdown steps in the "breakdown" field of your JSON response (copy them exactly from above)
- In your summary text: Simply mention that you've created a step-by-step plan (e.g., "I've created a step-by-step plan below to help you")
- DO NOT list or repeat the steps in your summary text - they will be displayed separately
- Keep your summary concise and focused on the answer to their question`
      : '';

    // Step 9: Generate AI response
    const prompt = `${CAREER_AGENT_PROMPT}

USER QUERY: "${query}"
${userContextInfo}
${ragContext}
${historyContext}
${resourceContext}
${breakdownContext}

Provide a helpful, structured response following the JSON format specified in your system prompt.
Complexity: ${complexityAnalysis.complexity}/10
Needs Breakdown: ${needsBreakdown}

Remember: If a breakdown was provided above, include it in the "breakdown" field but DO NOT duplicate the steps in your summary text. Just mention that a plan was created.

Respond in JSON format following your schema.`;

    const response = await groqStructuredOutput([
      { role: 'system', content: CAREER_AGENT_PROMPT + '\n\nYou must respond in valid JSON format.' },
      { role: 'user', content: prompt },
    ]);

    const aiResponse: AIResponse = JSON.parse(response.message.content || '{}');

    // Step 10: Enhance response with retrieved data
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
    
    console.log('🔍 Career agent response:', {
      hasPreGeneratedBreakdown: !!breakdown,
      breakdownLength: breakdown?.length || 0,
      finalBreakdown: finalBreakdown?.length || 0,
      needsBreakdown,
      complexity: complexityAnalysis.complexity,
    });
    
    // Build response object - ONLY include breakdown if it exists and has items
    const finalResponse: AIResponse = {
      domain: 'career',
      summary: aiResponse.summary || 'Here\'s guidance on your career question.',
      resources: resources.slice(0, 8), // Limit to top 8 resources
      sources: sources.slice(0, 5), // Limit to top 5 sources
      metadata: {
        confidence: aiResponse.metadata?.confidence || 0.8,
        complexity: complexityAnalysis.complexity,
        needsBreakdown,
        suggestedActions: aiResponse.metadata?.suggestedActions || [],
        retrievedFromRAG: ragSources.length,
        externalResourcesFound: externalResources.length,
      },
    };
    
    // Only add breakdown if it exists and has content
    if (finalBreakdown && finalBreakdown.length > 0) {
      finalResponse.breakdown = finalBreakdown;
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

