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
  session_id: string; // Session identifier for grouping conversations
  session_title?: string; // AI-generated or keyword-based session title
  is_first_message?: boolean; // Flag to identify session starter
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
      is_error: chatMessage.is_error || false,
      session_id: chatMessage.session_id, // Session tracking
      session_title: chatMessage.session_title, // Session title
      is_first_message: chatMessage.is_first_message || false, // Track first message
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
 * Can filter by session_id for session-specific context
 */
export async function getChatHistory(
  userId: string,
  limit: number = 50,
  category?: 'finance' | 'career' | 'daily_task',
  includeErrors: boolean = false, // By default, filter out errors
  session_id?: string // Optional: Filter by specific session
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

  // Filter by session if provided (for session-specific context)
  if (session_id) {
    query = query.eq('session_id', session_id);
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

// ============================================
// SESSION MANAGEMENT OPERATIONS
// ============================================

export interface ChatSession {
  session_id: string;
  session_title: string;
  message_count: number;
  last_message_at: string;
  category: 'finance' | 'career' | 'daily_task';
  first_message: string;
}

/**
 * Get list of chat sessions for a user (for sidebar display)
 */
export async function getChatSessions(
  userId: string,
  limit: number = 10
): Promise<ChatSession[]> {
  // Get all distinct sessions by grouping by session_id
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .select('session_id, session_title, category, message, created_at')
    .eq('user_id', userId)
    .eq('is_error', false)
    .order('created_at', { ascending: true }); // Get oldest first to find first message

  if (error) {
    console.error('Error getting chat sessions:', error);
    throw error;
  }

  // Group by session_id and get the first message of each session
  const sessionMap = new Map<string, any>();
  
  for (const msg of data) {
    if (!sessionMap.has(msg.session_id)) {
      sessionMap.set(msg.session_id, msg);
    }
  }

  // Convert to array and sort by most recent
  const uniqueSessions = Array.from(sessionMap.values())
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);

  // Get message counts for each session
  const sessions: ChatSession[] = [];
  
  for (const session of uniqueSessions) {
    const { count } = await supabaseAdmin
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('session_id', session.session_id)
      .eq('is_error', false);

    sessions.push({
      session_id: session.session_id,
      session_title: session.session_title || 'New Chat',
      message_count: count || 0,
      last_message_at: session.created_at,
      category: session.category,
      first_message: session.message,
    });
  }

  return sessions;
}

/**
 * Get all messages for a specific session
 */
export async function getSessionMessages(
  userId: string,
  session_id: string
) {
  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('session_id', session_id)
    .eq('is_error', false)
    .order('created_at', { ascending: true }); // Oldest first for display

  if (error) {
    console.error('Error getting session messages:', error);
    throw error;
  }

  return data;
}

/**
 * Generate session title from first message using keywords
 */
export function generateSessionTitle(firstMessage: string, category: string): string {
  // Clean the message
  const cleaned = firstMessage.toLowerCase().trim();
  
  // Extract keywords based on common patterns
  const keywords: string[] = [];
  
  // Common question starters to remove
  const removePatterns = [
    'how do i', 'how can i', 'how to', 'can you', 'could you',
    'help me', 'i need', 'i want', 'tell me', 'what is', 'what are',
    'explain', 'show me'
  ];
  
  let processed = cleaned;
  removePatterns.forEach(pattern => {
    processed = processed.replace(pattern, '');
  });
  
  // Get first 4-5 meaningful words
  const words = processed
    .split(' ')
    .filter(word => word.length > 2 && !['the', 'and', 'for', 'with'].includes(word))
    .slice(0, 4);
  
  let title = words.join(' ');
  
  // Capitalize first letter of each word
  title = title.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // DON'T add emoji here - it's already shown in the tab icon
  // Emoji rendering is handled by the frontend getCategoryIcon() function
  
  // Limit length
  if (title.length > 40) {
    title = title.substring(0, 37) + '...';
  }
  
  return title || 'New Chat';
}

/**
 * Update session title
 */
export async function updateSessionTitle(
  userId: string,
  session_id: string,
  title: string
) {
  const { error } = await supabaseAdmin
    .from('chat_messages')
    .update({ session_title: title })
    .eq('user_id', userId)
    .eq('session_id', session_id);

  if (error) {
    console.error('Error updating session title:', error);
    throw error;
  }
}

/**
 * Update chat message feedback with toggle count tracking
 * Locks feedback after 2 total selections (first click + one change)
 */
export async function updateChatMessageFeedback(
  messageId: string,
  userId: string,
  feedback: boolean | null
) {
  // First, get the current message to check toggle count
  const { data: currentMessage, error: fetchError } = await supabaseAdmin
    .from('chat_messages')
    .select('id, user_feedback, metadata')
    .eq('id', messageId)
    .eq('user_id', userId)
    .single();

  if (fetchError) {
    if (fetchError.code === 'PGRST116') {
      throw new Error('Message not found');
    }
    throw fetchError;
  }

  // Get current toggle count from metadata
  const currentToggleCount = currentMessage.metadata?.feedbackToggleCount || 0;
  const currentFeedback = currentMessage.user_feedback;

  // Check if feedback is locked (after 2 total selections)
  const isLocked = currentToggleCount >= 2;

  if (isLocked) {
    return {
      success: false,
      locked: true,
      message: 'Feedback is locked after 2 selections',
      feedback: currentFeedback,
      toggleCount: currentToggleCount,
    };
  }

  // Increment toggle count for ANY feedback change
  // This includes: first selection, changing selection, or removing feedback
  // Total of 2 chances: first click (count = 1) + one change (count = 2, locked)
  let newToggleCount = currentToggleCount + 1;

  // Check if this update would lock it
  const willBeLocked = newToggleCount >= 2;

  // Update the message
  const updatedMetadata = {
    ...currentMessage.metadata,
    feedbackToggleCount: newToggleCount,
  };

  const { data, error } = await supabaseAdmin
    .from('chat_messages')
    .update({
      user_feedback: feedback,
      metadata: updatedMetadata,
    })
    .eq('id', messageId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    success: true,
    feedback: data.user_feedback,
    locked: willBeLocked,
    toggleCount: newToggleCount,
  };
}
