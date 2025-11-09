// Breakdown Tool Agent
// Cognitive support for breaking down complex tasks into micro-steps

import { groqStructuredOutput, GROQ_MODELS } from '../groq/client';
import { BREAKDOWN_TOOL_PROMPT } from './prompts';
import { BreakdownRequest, BreakdownResponse } from './types';

/**
 * Check if query EXPLICITLY requests a breakdown/plan
 * VERY strict matching - only the clearest direct requests
 * Everything else should let the LLM decide whether to suggest breakdown
 */
export function explicitlyRequestsBreakdown(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  
  // Only the most explicit requests - user DIRECTLY asking for a plan/breakdown/tasks
  const explicitPlanKeywords = [
    // Plan variations
    'create a plan',
    'create plan',
    'make a plan', 
    'make plan',
    'build a plan',
    'build plan',
    'give me a plan',
    'give me plan',
    'show me a plan',
    'show me plan',
    'provide a plan',
    'provide plan',
    'i need a plan',
    'i need plan',
    
    // Task variations (critical for "provide me tasks", "give me tasks", etc.)
    'provide tasks',
    'provide me tasks',
    'give me tasks',
    'give me the tasks',
    'show me tasks',
    'show me the tasks',
    'list tasks',
    'list the tasks',
    'create tasks',
    'make tasks',
    'i need tasks',
    
    // Step variations
    'give me a step by step',
    'give me step by step',
    'show me the steps',
    'show me steps',
    'give me the steps',
    'give me steps',
    'list the steps',
    'list steps',
    'step by step',
    'step-by-step',
    'steps to',
    'steps for',
    
    // Breakdown variations
    'break it down',
    'break this down',
    'breakdown',
    'walk me through',
    'guide me through',
  ];
  
  // Check for explicit matches
  const hasExplicitRequest = explicitPlanKeywords.some(keyword => lowerQuery.includes(keyword));
  
  // EXCEPTION: "how to", "how do I", "how can I" are questions, not plan requests
  // Let LLM decide if these need breakdown
  const isHowToQuestion = lowerQuery.startsWith('how to') || 
                          lowerQuery.startsWith('how do i') || 
                          lowerQuery.startsWith('how can i') ||
                          lowerQuery.startsWith('how should i');
  
  if (isHowToQuestion && !lowerQuery.includes('step by step')) {
    return false; // Let LLM answer the question and suggest breakdown if needed
  }
  
  return hasExplicitRequest;
}

/**
 * Analyze task complexity and determine if breakdown is needed
 */
export async function analyzeTaskComplexity(
  task: string,
  context?: string
): Promise<{ complexity: number; needsBreakdown: boolean; reasoning: string }> {
  // Check for explicit breakdown request first
  if (explicitlyRequestsBreakdown(task)) {
    return {
      complexity: 7,
      needsBreakdown: true,
      reasoning: 'User explicitly requested a plan/breakdown',
    };
  }

  try {
    const prompt = `Analyze this task and determine its complexity:

Task: "${task}"
${context ? `Context: ${context}` : ''}

Respond in JSON format with ONLY the complexity analysis (not the full breakdown yet):
{
  "complexity": 0-10,
  "needsBreakdown": boolean,
  "reasoning": "Why this complexity score"
}`;

    const response = await groqStructuredOutput(
      [
        { role: 'system', content: BREAKDOWN_TOOL_PROMPT + '\n\nYou must respond in valid JSON format.' },
        { role: 'user', content: prompt },
      ],
      { model: GROQ_MODELS.LLAMA_8B_INSTANT } // Use fast 8B model for simple complexity analysis (saves tokens!)
    );

    const analysis = JSON.parse(response.message.content || '{}');

    return {
      complexity: analysis.complexity || 5,
      needsBreakdown: analysis.needsBreakdown || analysis.complexity >= 5,
      reasoning: analysis.reasoning || 'Task requires multiple steps',
    };
  } catch (error) {
    console.error('Error analyzing task complexity:', error);
    // Default to suggesting breakdown on error
    return {
      complexity: 5,
      needsBreakdown: true,
      reasoning: 'Unable to analyze, defaulting to breakdown support',
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
 * Check if query is a simple greeting or social interaction
 * These should NEVER trigger breakdowns
 */
export function isSimpleGreetingOrSocial(query: string): boolean {
  const lowerQuery = query.toLowerCase().trim();
  
  // Very short queries (likely greetings)
  if (lowerQuery.length < 15 && !lowerQuery.includes('how')) {
    return true;
  }
  
  // Common greetings and social phrases
  const greetings = [
    'hi',
    'hello',
    'hey',
    'good morning',
    'good afternoon',
    'good evening',
    'what\'s up',
    'whats up',
    'sup',
    'how are you',
    'how\'re you',
    'thanks',
    'thank you',
    'ok',
    'okay',
    'got it',
    'i see',
    'alright',
    'cool',
    'nice',
    'bye',
    'goodbye',
    'see you',
  ];
  
  // Check if query is EXACTLY or STARTS WITH a greeting
  const isGreeting = greetings.some(greeting => 
    lowerQuery === greeting || 
    lowerQuery.startsWith(greeting + ' ') ||
    lowerQuery.startsWith(greeting + '!') ||
    lowerQuery.startsWith(greeting + '.')
  );
  
  return isGreeting;
}

/**
 * Check if a query contains breakdown keywords
 */
export function containsBreakdownKeywords(query: string): boolean {
  const breakdownKeywords = [
    'break down',
    'break it down',
    'breakdown',
    'step by step',
    'step-by-step',
    'where do i start',
    'where to start',
    'how do i begin',
    'how to begin',
    'overwhelmed',
    'too much',
    'stuck',
    'can\'t start',
    'cannot start',
    'help me plan',
    'make a plan',
  ];

  const lowerQuery = query.toLowerCase();
  return breakdownKeywords.some((keyword) => lowerQuery.includes(keyword));
}

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

