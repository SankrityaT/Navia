// AI Context Builder
// Combines user profile, chat history, and semantic search for comprehensive AI context

import { getUserProfile } from '@/lib/supabase/operations';
import { getRecentChatContext } from '@/lib/supabase/operations';
import { retrieveRelevantContext, ChatMessage } from '@/lib/pinecone/chat-history';

export interface AIContext {
  userProfile: {
    name?: string;
    neurotypes?: Record<string, boolean>;
    efChallenges?: Record<string, boolean>;
    currentGoal?: string;
    jobField?: string;
    graduationTimeline?: string;
  };
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
  relevantPastConversations: ChatMessage[];
  profileSummary: string;
}

/**
 * Build comprehensive AI context for a user query
 * Combines Supabase (structured data) and Pinecone (semantic search)
 */
export async function buildAIContext(
  userId: string,
  currentQuery: string,
  category?: 'finance' | 'career' | 'daily_task'
): Promise<AIContext> {
  try {
    // 1. Get user profile from Supabase (fast structured data)
    const profile = await getUserProfile(userId);

    // 2. Get recent chat history from Supabase (chronological context)
    const recentMessages = await getRecentChatContext(userId, 5);

    // 3. Get semantically relevant past conversations from Pinecone
    const relevantConversations = await retrieveRelevantContext(
      userId,
      currentQuery,
      category,
      3
    );

    // 4. Build profile summary for AI
    const profileSummary = buildProfileSummary(profile);

    return {
      userProfile: {
        name: profile?.name,
        neurotypes: profile?.neurotypes as Record<string, boolean> | undefined,
        efChallenges: profile?.ef_challenges as Record<string, boolean> | undefined,
        currentGoal: profile?.current_goal,
        jobField: profile?.job_field,
        graduationTimeline: profile?.graduation_timeline,
      },
      recentMessages,
      relevantPastConversations: relevantConversations,
      profileSummary,
    };
  } catch (error) {
    console.error('Error building AI context:', error);
    // Return minimal context on error
    return {
      userProfile: {},
      recentMessages: [],
      relevantPastConversations: [],
      profileSummary: 'User profile unavailable.',
    };
  }
}

/**
 * Build a human-readable profile summary for AI system prompt
 */
function buildProfileSummary(profile: any): string {
  if (!profile) {
    return 'No user profile available.';
  }

  const parts: string[] = [];

  // Name
  if (profile.name) {
    parts.push(`User: ${profile.name}`);
  }

  // Neurotypes
  if (profile.neurotypes) {
    const activeNeurotypes = Object.entries(profile.neurotypes)
      .filter(([_, active]) => active)
      .map(([type]) => type.replace(/_/g, ' '));
    
    if (activeNeurotypes.length > 0) {
      parts.push(`Neurotypes: ${activeNeurotypes.join(', ')}`);
    }
  }

  // EF Challenges
  if (profile.ef_challenges) {
    const activeChallenges = Object.entries(profile.ef_challenges)
      .filter(([_, active]) => active)
      .map(([challenge]) => challenge.replace(/_/g, ' '));
    
    if (activeChallenges.length > 0) {
      parts.push(`Executive Function Challenges: ${activeChallenges.join(', ')}`);
      parts.push('These challenges may affect task initiation, time management, organization, and daily planning.');
    }
  }

  // Current Goal
  if (profile.current_goal) {
    parts.push(`Current Focus: ${profile.current_goal.replace(/_/g, ' ')}`);
    
    if (profile.job_field) {
      parts.push(`Job Field Interest: ${profile.job_field}`);
    }
  }

  // Graduation Timeline
  if (profile.graduation_timeline) {
    parts.push(`Graduation Timeline: ${profile.graduation_timeline}`);
  }

  // Add general context
  parts.push('User is a neurodivergent young adult navigating post-college life transitions.');
  parts.push('They benefit from structured guidance, breakdown of complex tasks, and supportive, non-judgmental communication.');

  return parts.join('\n');
}

/**
 * Format AI context for system prompt
 */
export function formatContextForPrompt(context: AIContext): string {
  const sections: string[] = [];

  // Profile
  sections.push('=== USER PROFILE ===');
  sections.push(context.profileSummary);

  // Recent conversation history
  if (context.recentMessages.length > 0) {
    sections.push('\n=== RECENT CONVERSATION ===');
    context.recentMessages.forEach((msg) => {
      sections.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
    });
  }

  // Relevant past conversations
  if (context.relevantPastConversations.length > 0) {
    sections.push('\n=== RELEVANT PAST DISCUSSIONS ===');
    context.relevantPastConversations.forEach((conv, idx) => {
      sections.push(`\nPast Discussion ${idx + 1} (${conv.category}):`);
      sections.push(`User: ${conv.message}`);
      sections.push(`Assistant: ${conv.response}`);
    });
  }

  return sections.join('\n');
}

/**
 * Get minimal context (for quick responses)
 */
export async function getMinimalContext(userId: string): Promise<string> {
  try {
    const profile = await getUserProfile(userId);
    return buildProfileSummary(profile);
  } catch (error) {
    console.error('Error getting minimal context:', error);
    return 'User profile unavailable.';
  }
}

/**
 * Check if user has sufficient context for personalized responses
 */
export async function hasUserContext(userId: string): Promise<boolean> {
  try {
    const profile = await getUserProfile(userId);
    return profile?.onboarded === true;
  } catch (error) {
    return false;
  }
}
