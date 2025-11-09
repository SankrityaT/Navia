// User Context Retrieval for AI Agents
// Helper functions to get user profile data for personalized agent responses

import { getUserProfile } from './operations';

export interface UserProfileContext {
  name: string;
  efChallenges: string[];
  goals: string[];
  graduationDate?: string;
  university?: string;
}

/**
 * Get user profile context for AI agents
 * Returns structured data that agents can use for personalization
 */
export async function getUserContextForAgent(userId: string): Promise<UserProfileContext | null> {
  try {
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return null;
    }

    return {
      name: profile.name,
      efChallenges: profile.ef_challenges || [],
      goals: profile.goals || [],
      graduationDate: profile.graduation_date,
      university: profile.university,
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
}

/**
 * Format user context as text for LLM context
 */
export function formatUserContextForLLM(context: UserProfileContext): string {
  const efText = context.efChallenges.length > 0
    ? `Executive Function Challenges: ${context.efChallenges.join(', ')}`
    : 'No specific EF challenges noted';
  
  const goalsText = context.goals.length > 0
    ? `Current Goals: ${context.goals.join(', ')}`
    : 'Goals not yet defined';

  return `
User: ${context.name}
${context.university ? `Education: ${context.university} (graduated ${context.graduationDate || 'recently'})` : ''}
${efText}
${goalsText}

This user is a neurodivergent young adult. Please provide:
- Supportive, non-judgmental guidance
- Clear, structured responses
- Task breakdowns when appropriate
- Acknowledgment of executive function challenges
`.trim();
}

/**
 * Get EF-specific recommendations based on user profile
 */
export function getEFRecommendations(efChallenges: string[]): string[] {
  const recommendations: string[] = [];

  if (efChallenges.includes('task_initiation') || efChallenges.includes('task initiation')) {
    recommendations.push('Use the 5-minute rule to overcome starting barriers');
    recommendations.push('Try body doubling (working alongside someone)');
  }

  if (efChallenges.includes('time_management') || efChallenges.includes('time management') || 
      efChallenges.includes('time_blindness') || efChallenges.includes('time blindness')) {
    recommendations.push('Use visual timers instead of phone alarms');
    recommendations.push('Set multiple reminders before deadlines');
  }

  if (efChallenges.includes('organization')) {
    recommendations.push('One simple system is better than a perfect complex one');
    recommendations.push('Use the "one touch" rule: deal with items immediately');
  }

  if (efChallenges.includes('working_memory') || efChallenges.includes('working memory')) {
    recommendations.push('Write things down immediately - don\'t trust your memory');
    recommendations.push('Keep important info visible (sticky notes, whiteboards)');
  }

  if (efChallenges.includes('focus') || efChallenges.includes('concentration')) {
    recommendations.push('Use the Pomodoro technique (25 min work, 5 min break)');
    recommendations.push('Eliminate distractions before starting tasks');
  }

  if (efChallenges.includes('overwhelm') || efChallenges.includes('anxiety')) {
    recommendations.push('Break everything into micro-steps');
    recommendations.push('Rest is productive - schedule downtime');
  }

  return recommendations;
}

/**
 * Check if user needs breakdown support based on their EF profile
 */
export function shouldSuggestBreakdown(efChallenges: string[]): boolean {
  // Users with these challenges especially benefit from task breakdowns
  const breakdownIndicators = [
    'task_initiation',
    'task initiation',
    'overwhelm',
    'anxiety',
    'planning',
    'organization',
  ];

  return efChallenges.some((challenge) =>
    breakdownIndicators.some((indicator) =>
      challenge.toLowerCase().includes(indicator.toLowerCase())
    )
  );
}

/**
 * Get appropriate energy-level message based on profile
 */
export function getEnergyLevelGuidance(
  energyLevel: 'low' | 'medium' | 'high',
  efChallenges: string[]
): string {
  if (energyLevel === 'low') {
    return 'You have low energy right now. Let\'s focus on simple, achievable tasks. Rest is also productive.';
  } else if (energyLevel === 'high') {
    return 'You have good energy! This is a great time to tackle more challenging tasks.';
  } else {
    return 'You have moderate energy. Let\'s find a balanced approach.';
  }
}

