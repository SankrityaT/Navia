// Breakdown Tool Agent
// Cognitive support for breaking down complex tasks into micro-steps
// LLM-driven decision making - no explicit keyword matching

import { groqStructuredOutput, GROQ_MODELS } from '../groq/client';
import { BREAKDOWN_TOOL_PROMPT } from './prompts';
import { BreakdownRequest, BreakdownResponse } from './types';

/**
 * Use LLM to determine if query explicitly requests a breakdown/plan
 * No hardcoded keywords - let AI understand natural language intent
 * Now with conversation history support for follow-up requests like "break that down"
 */
export async function explicitlyRequestsBreakdown(
  query: string,
  conversationHistory?: Array<{role: string, content: string, isSemanticMatch?: boolean}>
): Promise<boolean> {
  try {
    // Build conversation context if available
    const historyContext = conversationHistory && conversationHistory.length > 0
      ? `\n\nRECENT CONVERSATION (last ${Math.min(10, conversationHistory.length)} messages for context):\n${conversationHistory
          .slice(-10) // Only last 10 messages for intent detection
          .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Navia'}: ${msg.content}`)
          .join('\n')}\n`
      : '';

    const prompt = `Analyze this user query and determine if they are EXPLICITLY asking for a plan, breakdown, or step-by-step guide.

User Query: "${query}"
${historyContext}

Consider:
- Are they directly asking for a plan, steps, tasks, or breakdown?
- Are they using phrases like "break it down", "step by step", "give me tasks", "create a plan", "walk me through"?
- If they say "break THAT down" or "give me a plan for THIS", use the conversation history to understand what they're referring to
- Respond "true" ONLY if they explicitly want a structured plan/breakdown
- Respond "false" if they're asking a general question, seeking advice, or having a conversation

Respond in JSON format:
{
  "explicitRequest": boolean,
  "reasoning": "Why this is or isn't an explicit breakdown request"
}`;

    const response = await groqStructuredOutput(
      [
        { role: 'system', content: 'You are a query intent analyzer with conversation context awareness. Respond ONLY in valid JSON format.' },
        { role: 'user', content: prompt },
      ],
      { model: GROQ_MODELS.LLAMA_4_SCOUT } // Main model for all agents
    );

    const analysis = JSON.parse(response.message.content || '{}');
    return analysis.explicitRequest || false;
  } catch (error) {
    console.error('Error analyzing explicit breakdown request:', error);
    // Default to false - let complexity analysis decide
    return false;
  }
}

/**
 * Analyze task complexity and determine if breakdown is needed
 * LLM makes intelligent decision based on query nature and complexity
 */
export async function analyzeTaskComplexity(
  task: string,
  context?: string
): Promise<{ complexity: number; needsBreakdown: boolean; reasoning: string }> {
  // Check for explicit breakdown request first
  const isExplicitRequest = await explicitlyRequestsBreakdown(task);
  if (isExplicitRequest) {
    return {
      complexity: 7,
      needsBreakdown: true,
      reasoning: 'User explicitly requested a plan/breakdown',
    };
  }

  try {
    const prompt = `Analyze this user query and intelligently decide if it needs a structured breakdown/plan.

User Query: "${task}"
${context ? `Context: ${context}` : ''}

Decision Criteria:
1. Is this a simple question that needs a direct answer? → No breakdown needed
2. Is this a greeting, thank you, or casual conversation? → No breakdown needed
3. Is this a complex task with multiple steps? → Breakdown likely helpful
4. Is the user feeling overwhelmed or stuck? → Breakdown could help
5. Would breaking this down into steps actually be useful, or is a simple answer better?

Be smart about this - don't over-break-down simple queries. Only suggest breakdown when it genuinely adds value.

Respond in JSON format:
{
  "complexity": 0-10 (0=trivial like "hi", 10=very complex multi-step task),
  "needsBreakdown": boolean (true only if breakdown would genuinely help),
  "reasoning": "Brief explanation of why breakdown is/isn't needed",
  "queryType": "greeting|simple_question|advice_seeking|complex_task|overwhelmed"
}`;

    const response = await groqStructuredOutput(
      [
        { role: 'system', content: 'You are an intelligent task complexity analyzer. Be practical and user-focused. Respond ONLY in valid JSON format.' },
        { role: 'user', content: prompt },
      ],
      { model: GROQ_MODELS.LLAMA_8B_INSTANT } // Fast model for quick analysis
    );

    const analysis = JSON.parse(response.message.content || '{}');

    return {
      complexity: analysis.complexity || 5,
      needsBreakdown: analysis.needsBreakdown || false, // Default to false, only break down if LLM says so
      reasoning: analysis.reasoning || 'Task complexity analyzed',
    };
  } catch (error) {
    console.error('Error analyzing task complexity:', error);
    // Default to NO breakdown on error - let agents handle normally
    return {
      complexity: 3,
      needsBreakdown: false,
      reasoning: 'Unable to analyze, defaulting to simple response',
    };
  }
}

/**
 * Generate a breakdown for a complex task
 */
export async function generateBreakdown(
  request: BreakdownRequest
): Promise<BreakdownResponse> {
  try {
    const { task, context, userEFProfile } = request;

    const userProfileInfo = userEFProfile?.length
      ? `\n\nUser's EF Profile: ${userEFProfile.join(', ')}\n(Adjust breakdown to accommodate these challenges)`
      : '';

    const prompt = `Please break down this task into manageable micro-steps:

Task: "${task}"
${context ? `Context: ${context}` : ''}
${userProfileInfo}

Respond in JSON format with a complete breakdown following your guidelines.`;

    const response = await groqStructuredOutput([
      { role: 'system', content: BREAKDOWN_TOOL_PROMPT + '\n\nYou must respond in valid JSON format.' },
      { role: 'user', content: prompt },
    ]);

    const breakdown: BreakdownResponse = JSON.parse(response.message.content || '{}');

    // Ensure required fields exist
    if (!breakdown.breakdown || !Array.isArray(breakdown.breakdown)) {
      throw new Error('Invalid breakdown format');
    }

    return {
      breakdown: breakdown.breakdown,
      needsBreakdown: true,
      complexity: breakdown.complexity || 5,
      estimatedTime: breakdown.estimatedTime,
      tips: breakdown.tips || [],
    };
  } catch (error) {
    console.error('Error generating breakdown:', error);
    
    // Fallback: simple 3-step breakdown
    return {
      breakdown: [
        'Step 1: Gather any materials or information you need',
        'Step 2: Complete the main task in small chunks',
        'Step 3: Review what you\'ve done and celebrate completion',
      ],
      needsBreakdown: true,
      complexity: 5,
      estimatedTime: 'Varies based on task',
      tips: ['Take breaks between steps', 'You don\'t have to do it all at once'],
    };
  }
}

/**
 * REMOVED: isSimpleGreetingOrSocial() and containsBreakdownKeywords()
 * These are now handled intelligently by the LLM in analyzeTaskComplexity()
 * No more hardcoded keyword matching!
 */

/**
 * Generate a user-friendly confirmation message for breakdown
 */
export function generateBreakdownConfirmation(task: string, complexity: number): string {
  if (complexity >= 7) {
    return `This looks like a complex task. Would you like me to break "${task}" into smaller, manageable steps? It might help reduce overwhelm.`;
  } else if (complexity >= 5) {
    return `I can break "${task}" down into clear steps if that would be helpful. Would you like me to do that?`;
  } else {
    return `Would you like me to create a simple step-by-step plan for "${task}"?`;
  }
}

/**
 * Combine multiple breakdowns (when query spans multiple domains)
 */
export function combineBreakdowns(
  breakdowns: Array<{ domain: string; breakdown: string[] }>
): string[] {
  if (breakdowns.length === 0) return [];
  if (breakdowns.length === 1) return breakdowns[0].breakdown;

  // Combine with section headers
  const combined: string[] = [];
  
  breakdowns.forEach(({ domain, breakdown }, index) => {
    if (index > 0) {
      combined.push(''); // Empty line between sections
    }
    
    const domainLabel = domain === 'daily_task' ? 'Task Management' : 
                       domain.charAt(0).toUpperCase() + domain.slice(1);
    
    combined.push(`${domainLabel} Steps:`);
    breakdown.forEach((step) => combined.push(step));
  });

  return combined;
}

/**
 * Simplify breakdown for low energy users
 */
export function simplifyBreakdownForLowEnergy(breakdown: string[]): string[] {
  // Take only first 3 steps and make them even simpler
  return breakdown.slice(0, 3).map((step, index) => {
    // Remove time estimates and extra details for low energy
    const simplifiedStep = step.split('(')[0].trim();
    return `${index + 1}. ${simplifiedStep}`;
  });
}

/**
 * Add encouraging tips based on EF profile
 */
export function addEFSpecificTips(efProfile: string[]): string[] {
  const tips: string[] = [];

  if (efProfile.includes('task_initiation') || efProfile.includes('procrastination')) {
    tips.push('Set a timer for just 5 minutes to start - you can stop after if needed');
    tips.push('The hardest part is starting; it gets easier once you begin');
  }

  if (efProfile.includes('time_blindness') || efProfile.includes('time_management')) {
    tips.push('Use a visual timer you can see while working');
    tips.push('Set alarms for transitions between steps');
  }

  if (efProfile.includes('working_memory')) {
    tips.push('Write down each step as you complete it');
    tips.push('Keep this breakdown visible while working');
  }

  if (efProfile.includes('overwhelm') || efProfile.includes('anxiety')) {
    tips.push('You don\'t have to do all steps today');
    tips.push('Taking breaks is productive, not lazy');
  }

  // Default tips if none match
  if (tips.length === 0) {
    tips.push('Progress over perfection');
    tips.push('Celebrate completing each step');
  }

  return tips;
}

