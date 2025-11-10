// Supabase operations for user profiles and chat history
// Provides CRUD operations with proper error handling

import { supabaseAdmin } from './client';

// ============================================
// USER PROFILE OPERATIONS
// ============================================

export interface UserProfile {
  clerk_user_id: string;
  name?: string;
  email?: string;
  graduation_timeline?: string;
  neurotypes?: Record<string, boolean>;
  other_neurotype?: string;
  ef_challenges?: Record<string, boolean>;
  current_goal?: string;
  current_goals?: string[]; // Array of goals for multi-select
  job_field?: string;
  interests?: string[]; // User's interests for peer matching
  seeking?: string[]; // What user is looking for in peers
  offers?: string[]; // What user can offer to peers
  onboarded?: boolean;
  onboarded_at?: string;
}

/**
 * Create or update user profile in Supabase
 */
export async function upsertUserProfile(profile: UserProfile) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .upsert({
      clerk_user_id: profile.clerk_user_id,
      name: profile.name,
      email: profile.email,
      graduation_timeline: profile.graduation_timeline,
      neurotypes: profile.neurotypes,
      other_neurotype: profile.other_neurotype,
      ef_challenges: profile.ef_challenges,
      current_goal: profile.current_goal,
      current_goals: profile.current_goals,
      job_field: profile.job_field,
      interests: profile.interests,
      seeking: profile.seeking,
      offers: profile.offers,
      onboarded: profile.onboarded,
      onboarded_at: profile.onboarded_at,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'clerk_user_id'
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting user profile:', error);
    throw error;
  }

  return data;
}

/**
 * Get user profile from Supabase
 */
export async function getUserProfile(clerkUserId: string) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - user not found
      return null;
    }
    console.error('Error getting user profile:', error);
    throw error;
  }

  return data;
}

/**
 * Check if user has completed onboarding
 */
export async function isUserOnboarded(clerkUserId: string): Promise<boolean> {
  const profile = await getUserProfile(clerkUserId);
  return profile?.onboarded === true;
}

// ============================================
// CHAT MESSAGE OPERATIONS
// ============================================

export interface ChatMessage {
  user_id: string;
  message: string;
  response: string;
  category: 'finance' | 'career' | 'daily_task';
  persona: string;
  metadata?: Record<string, any>;
  pinecone_id?: string;
  is_error?: boolean; // Flag to mark error responses (API failures, rate limits, etc.)
}

/**
 * Store chat message in Supabase
 */
export async function storeChatMessage(chatMessage: ChatMessage) {
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .insert({
      user_id: chatMessage.user_id,
      message: chatMessage.message,
      response: chatMessage.response,
      category: chatMessage.category,
      persona: chatMessage.persona,
      metadata: chatMessage.metadata,
      pinecone_id: chatMessage.pinecone_id,
      is_error: chatMessage.is_error || false, // Default to false for successful messages
    })
    .select()
    .single();

  if (error) {
    console.error('Error storing chat message:', error);
    throw error;
  }

  return data;
}

/**
 * Get chat history for a user (formatted for frontend display)
 * By default, excludes error messages to keep UI clean
 */
export async function getChatHistory(
  userId: string,
  limit: number = 50,
  category?: 'finance' | 'career' | 'daily_task',
  includeErrors: boolean = false // By default, filter out errors
) {
  let query = supabaseAdmin
    .from('chat_messages')
    .select('id, user_id, message, response, category, persona, metadata, pinecone_id, is_error, user_feedback, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  // Filter out errors unless explicitly requested
  if (!includeErrors) {
    query = query.eq('is_error', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }

  return data;
}

/**
 * Get formatted chat history for AI context (role + content format)
 */
export async function getChatHistoryForAI(
  userId: string,
  limit: number = 10,
  category?: 'finance' | 'career' | 'daily_task'
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const messages = await getChatHistory(userId, limit, category);
  
  // Convert to AI format (oldest first for proper conversation flow)
  const context: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  
  // Reverse because getChatHistory returns newest first
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    context.push({ role: 'user', content: msg.message });
    context.push({ role: 'assistant', content: msg.response });
  }
  
  return context;
}

/**
 * Get recent chat context for AI (last N messages)
 */
export async function getRecentChatContext(
  userId: string,
  limit: number = 5
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const messages = await getChatHistory(userId, limit);
  
  // Convert to chat format (newest first, so reverse)
  const context: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    context.push({ role: 'user', content: msg.message });
    context.push({ role: 'assistant', content: msg.response });
  }
  
  return context;
}

/**
 * Delete old chat messages (cleanup)
 */
export async function deleteOldChatMessages(
  userId: string,
  olderThanDays: number = 90
) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const { error } = await supabaseAdmin
    .from('chat_messages')
    .delete()
    .eq('user_id', userId)
    .lt('created_at', cutoffDate.toISOString());

  if (error) {
    console.error('Error deleting old chat messages:', error);
    throw error;
  }
}

/**
 * Get chat statistics for a user (excludes error messages)
 */
export async function getChatStatistics(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .select('category, created_at')
    .eq('user_id', userId)
    .eq('is_error', false); // Exclude errors from statistics

  if (error) {
    console.error('Error getting chat statistics:', error);
    return {
      totalChats: 0,
      byCategory: { finance: 0, career: 0, daily_task: 0 },
      recentActivity: [],
    };
  }

  const byCategory = {
    finance: 0,
    career: 0,
    daily_task: 0,
  };

  const byDate: Record<string, number> = {};

  data.forEach((msg) => {
    byCategory[msg.category as keyof typeof byCategory]++;
    const date = new Date(msg.created_at).toISOString().split('T')[0];
    byDate[date] = (byDate[date] || 0) + 1;
  });

  const recentActivity = Object.entries(byDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);

  return {
    totalChats: data.length,
    byCategory,
    recentActivity,
  };
}

/**
 * Update user feedback for a chat message
 * Tracks toggle count and enforces 2-toggle maximum
 */
export async function updateChatMessageFeedback(
  messageId: string,
  userId: string,
  feedback: boolean | null
) {
  // First, verify the message belongs to the user
  const { data: message, error: fetchError } = await supabaseAdmin
    .from('chat_messages')
    .select('user_id, metadata, user_feedback')
    .eq('id', messageId)
    .single();

  if (fetchError) {
    console.error('Error fetching message:', fetchError);
    throw new Error('Message not found');
  }

  if (message.user_id !== userId) {
    throw new Error('Unauthorized: Cannot update feedback for another user\'s message');
  }

  // Get current toggle count from metadata
  const currentMetadata = message.metadata || {};
  const currentToggleCount = currentMetadata.feedbackToggleCount || 0;
  const currentFeedback = message.user_feedback;

  // Check if feedback is actually changing (not the same value)
  const isChanging = currentFeedback !== feedback;
  
  // Calculate new toggle count
  let newToggleCount = currentToggleCount;
  if (isChanging) {
    newToggleCount = currentToggleCount + 1;
  }

  // Enforce 2-toggle maximum
  if (newToggleCount > 2) {
    return {
      success: false,
      locked: true,
      message: 'Feedback is locked after 2 changes',
      toggleCount: currentToggleCount,
    };
  }

  // Update the message with new feedback and toggle count
  const updatedMetadata = {
    ...currentMetadata,
    feedbackToggleCount: newToggleCount,
  };

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .update({
      user_feedback: feedback,
      metadata: updatedMetadata,
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    console.error('Error updating feedback:', error);
    throw error;
  }

  return {
    success: true,
    locked: newToggleCount >= 2,
    toggleCount: newToggleCount,
    feedback: feedback,
  };
}
