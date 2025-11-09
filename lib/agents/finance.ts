// Finance Agent
// Specialized agent for budgeting, financial planning, and money management

import { groqStructuredOutput } from '../groq/client';
import { FINANCE_AGENT_PROMPT } from './prompts';
import { AgentContext, AIResponse, ResourceLink, SourceReference } from './types';
import { retrieveFinanceSources } from '../pinecone/rag';
import { retrieveRelevantContext } from '../pinecone/chat-history';
import {
  searchFinancialResources,
  getBudgetingTips,
  getBudgetingTools,
  getDebtManagementAdvice,
  searchStudentBenefits,
} from '../tools/finance-tools';
import { generateBreakdown, analyzeTaskComplexity, explicitlyRequestsBreakdown, isSimpleGreetingOrSocial } from './breakdown';

/**
 * Process a finance-related query
 */
export async function processFinanceQuery(
  context: AgentContext
): Promise<AIResponse> {
  try {
    const { userId, query, userContext } = context;

    // Step 1: Retrieve relevant knowledge from Pinecone
    const ragSources = await retrieveFinanceSources(query, 5);

    // Step 2: Retrieve relevant past conversations
    const chatHistory = await retrieveRelevantContext(userId, query, 'finance', 3);

    // Step 3: Determine specific finance topic and fetch external resources
    const externalResources = await fetchRelevantFinanceResources(query);

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
          .map((r) => `- ${r.title}: ${r.description}`)
          .join('\n')}`
      : '';

    const userContextInfo = userContext
      ? `\n\nUSER CONTEXT:\n- Energy Level: ${userContext.energy_level || 'unknown'}\n- EF Profile: ${userContext.ef_profile?.join(', ') || 'not provided'}\n- Goals: ${userContext.current_goals?.join(', ') || 'not provided'}`
      : '';

    // Step 5: Check if query is a simple greeting - NEVER suggest breakdown for these
    const isGreeting = isSimpleGreetingOrSocial(query);
    
    // Step 6: Check if user EXPLICITLY requested a breakdown
    const explicitBreakdownRequest = !isGreeting && explicitlyRequestsBreakdown(query);

    // Step 7: Generate breakdown ONLY if explicitly requested (and not a greeting)
    let breakdown: string[] | undefined;
    if (explicitBreakdownRequest) {
      console.log('🎯 Finance: User explicitly requested breakdown, generating...');
      const breakdownResult = await generateBreakdown({
        task: query,
        context: 'Finance task',
        userEFProfile: userContext?.ef_profile,
      });
      breakdown = breakdownResult.breakdown;
    }

    // Step 8: Analyze complexity for metadata (only for logging/context)
    const complexityAnalysis = await analyzeTaskComplexity(query);
    
    // Important: If breakdown was already generated, we'll set needsBreakdown to false
    // Otherwise, we'll let the LLM decide by passing complexity to it
    // The LLM will return needsBreakdown in its response metadata

    // Step 8: Build breakdown context if generated
    const breakdownContext = breakdown && breakdown.length > 0
      ? `\n\n✅ STEP-BY-STEP PLAN GENERATED:\n${breakdown.map((step, i) => `${i + 1}. ${step}`).join('\n')}\n\nCRITICAL INSTRUCTIONS:
- Include the breakdown steps in the "breakdown" field of your JSON response (copy them exactly from above)
- In your summary text: Simply mention that you've created a step-by-step plan (e.g., "I've created a step-by-step plan below to help you")
- DO NOT list or repeat the steps in your summary text - they will be displayed separately
- Keep your summary concise and focused on the answer to their question`
      : '';

    // Step 9: Generate AI response
    const prompt = `${FINANCE_AGENT_PROMPT}

USER QUERY: "${query}"
${userContextInfo}
${ragContext}
${historyContext}
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
      { role: 'system', content: FINANCE_AGENT_PROMPT + '\n\nYou must respond in valid JSON format.' },
      { role: 'user', content: prompt },
    ]);

    const aiResponse: AIResponse = JSON.parse(response.message.content || '{}');

    // Step 10: Determine final needsBreakdown value
    // PRIORITY ORDER:
    // 1. If it's a greeting/social interaction → always false
    // 2. If breakdown was pre-generated → false
    // 3. Otherwise → trust LLM's decision
    const finalNeedsBreakdown = isGreeting 
      ? false  // NEVER suggest breakdown for greetings
      : breakdown && breakdown.length > 0 
        ? false  // Breakdown already provided
        : (aiResponse.metadata?.needsBreakdown ?? false); // Use LLM's decision

    console.log('🤖 Finance LLM decision:', {
      query: query.substring(0, 50),
      isGreeting,
      llmNeedsBreakdown: aiResponse.metadata?.needsBreakdown,
      hasPreGeneratedBreakdown: !!breakdown,
      finalNeedsBreakdown,
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
      title: r.title,
      url: r.url,
      description: r.description,
      type: r.category === 'tools' ? 'tool' : 'article',
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
    
    console.log('🔍 Finance agent final response:', {
      hasPreGeneratedBreakdown: !!breakdown,
      breakdownLength: breakdown?.length || 0,
      finalBreakdown: finalBreakdown?.length || 0,
      finalNeedsBreakdown,
      complexity: complexityAnalysis.complexity,
    });
    
    // Build response object - ONLY include breakdown if it exists and has items
    const finalResponse: AIResponse = {
      domain: 'finance',
      summary: aiResponse.summary || 'Here\'s guidance on your finance question.',
      resources: resources.slice(0, 8), // Limit to top 8 resources
      sources: sources.slice(0, 5), // Limit to top 5 sources
      metadata: {
        confidence: aiResponse.metadata?.confidence || 0.8,
        complexity: complexityAnalysis.complexity,
        needsBreakdown: finalNeedsBreakdown, // Use calculated value
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
    console.error('Finance agent error:', error);
    
    // Return fallback response
    return {
      domain: 'finance',
      summary: 'I encountered an issue processing your finance question. Please try rephrasing or asking a more specific question about budgeting, expenses, or financial planning.',
      metadata: {
        confidence: 0.3,
        error: 'Processing error',
      },
    };
  }
}

/**
 * Fetch relevant external finance resources based on query topic
 * Always includes web search for real-time information
 */
async function fetchRelevantFinanceResources(query: string): Promise<any[]> {
  const lowerQuery = query.toLowerCase();
  const resources: any[] = [];

  try {
    // ALWAYS do web search first for real-time sources
    console.log('🔍 Searching web for finance resources...');
    const webResults = await searchFinancialResources(query);
    resources.push(...webResults);
    console.log(`✅ Found ${webResults.length} web results`);

    // Budgeting queries - add specific tools
    if (lowerQuery.includes('budget') || lowerQuery.includes('expense') || lowerQuery.includes('track')) {
      const [tips, tools] = await Promise.all([
        getBudgetingTips(),
        getBudgetingTools(),
      ]);
      resources.push(...tips, ...tools);
    }

    // Debt management
    if (lowerQuery.includes('debt') || lowerQuery.includes('loan') || lowerQuery.includes('credit')) {
      const debtAdvice = await getDebtManagementAdvice(query);
      resources.push(...debtAdvice);
    }

    // Student benefits
    if (lowerQuery.includes('student') || lowerQuery.includes('benefit') || lowerQuery.includes('aid') || lowerQuery.includes('disability')) {
      const benefits = await searchStudentBenefits(query);
      resources.push(...benefits);
    }

    return resources.slice(0, 8); // Return more resources
  } catch (error) {
    console.error('Error fetching finance resources:', error);
    return [];
  }
}

/**
 * Detect specific finance sub-topics for better resource retrieval
 */
export function detectFinanceSubTopic(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('budget') || lowerQuery.includes('expense')) return 'budgeting';
  if (lowerQuery.includes('debt') || lowerQuery.includes('loan')) return 'debt';
  if (lowerQuery.includes('save') || lowerQuery.includes('saving')) return 'savings';
  if (lowerQuery.includes('benefit') || lowerQuery.includes('aid')) return 'benefits';
  if (lowerQuery.includes('app') || lowerQuery.includes('tool')) return 'tools';

  return 'general';
}

