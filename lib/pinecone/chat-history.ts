// Pinecone: Chat history storage and retrieval
// Stores conversations with metadata for context-aware AI responses

import { getIndex } from './client';
import { generateEmbedding } from '../embeddings/client';

export interface ChatMessage {
  userId: string;
  message: string;
  response: string;
  category: 'finance' | 'career' | 'daily_task';
  persona: string;
  timestamp: number;
  metadata: Record<string, any>;
}

export interface StoredChatMetadata {
  userId: string;
  category: string;
  persona: string;
  timestamp: number;
  messagePreview: string;
  responsePreview: string;
  [key: string]: any;
}

/**
 * Generate a unique ID for a chat message
 */
function generateChatId(userId: string, timestamp: number): string {
  return `chat_${userId}_${timestamp}`;
}

/**
 * Store a chat message in Pinecone with embeddings
 */
export async function storeChatMessage(
  userId: string,
  message: string,
  response: string,
  metadata: {
    category: 'finance' | 'career' | 'daily_task';
    persona: string;
    [key: string]: any;
  }
): Promise<void> {
  try {
    const index = getIndex();
    const timestamp = Date.now();

    // Create embedding from both message and response for better semantic search
    const textToEmbed = `User: ${message}\nAssistant: ${response}`;
    const vector = await generateEmbedding(textToEmbed);

    // Store in Pinecone
    // Destructure to avoid duplicate keys (category, persona already in metadata)
    const { category, persona, ...otherMetadata } = metadata;
    
    await index.upsert([
      {
        id: generateChatId(userId, timestamp),
        values: vector,
        metadata: {
          userId,
          category,
          persona,
          timestamp,
          messagePreview: message.substring(0, 200),
          responsePreview: response.substring(0, 200),
          fullMessage: message,
          fullResponse: response,
          ...otherMetadata,
        },
      },
    ]);

    console.log(`Stored chat message for user ${userId} in category ${category}`);
  } catch (error) {
    console.error('Error storing chat message:', error);
    throw error;
  }
}

/**
 * Retrieve recent chat history for a user
 */
export async function retrieveChatHistory(
  userId: string,
  limit: number = 10,
  category?: 'finance' | 'career' | 'daily_task'
): Promise<ChatMessage[]> {
  try {
    const index = getIndex();

    // Query with a zero vector to get recent messages based on metadata filtering
    const zeroVector = new Array(1024).fill(0);

    const filter: any = { userId };
    if (category) {
      filter.category = category;
    }

    const queryResponse = await index.query({
      vector: zeroVector,
      topK: limit,
      includeMetadata: true,
      filter,
    });

    const messages = queryResponse.matches
      .map((match) => {
        if (!match.metadata) return null;
        
        return {
          userId: match.metadata.userId as string,
          message: match.metadata.fullMessage as string,
          response: match.metadata.fullResponse as string,
          category: match.metadata.category as 'finance' | 'career' | 'daily_task',
          persona: match.metadata.persona as string,
          timestamp: match.metadata.timestamp as number,
          metadata: match.metadata,
        };
      })
      .filter((msg): msg is ChatMessage => msg !== null)
      .sort((a, b) => b.timestamp - a.timestamp);

    return messages;
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return [];
  }
}

/**
 * Retrieve relevant chat context using semantic search
 */
export async function retrieveRelevantContext(
  userId: string,
  query: string,
  category?: 'finance' | 'career' | 'daily_task',
  limit: number = 5
): Promise<ChatMessage[]> {
  try {
    const index = getIndex();

    // Create embedding for the query
    const vector = await generateEmbedding(query);

    // Build filter
    const filter: any = { userId };
    if (category) {
      filter.category = category;
    }

    // Query Pinecone for semantically similar past conversations
    const queryResponse = await index.query({
      vector,
      topK: limit,
      includeMetadata: true,
      filter,
    });

    const messages: ChatMessage[] = queryResponse.matches
      .filter((match) => match.score && match.score > 0.7) // Only include relevant matches
      .map((match) => {
        if (!match.metadata) return null;

        return {
          userId: match.metadata.userId as string,
          message: match.metadata.fullMessage as string,
          response: match.metadata.fullResponse as string,
          category: match.metadata.category as 'finance' | 'career' | 'daily_task',
          persona: match.metadata.persona as string,
          timestamp: match.metadata.timestamp as number,
          metadata: match.metadata,
        };
      })
      .filter((msg): msg is ChatMessage => msg !== null);

    return messages;
  } catch (error) {
    console.error('Error retrieving relevant context:', error);
    return [];
  }
}

/**
 * Delete old chat history (optional cleanup function)
 */
export async function deleteOldChatHistory(
  userId: string,
  olderThanDays: number = 90
): Promise<number> {
  try {
    const index = getIndex();
    const cutoffTimestamp = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;

    // Note: Pinecone doesn't support complex delete queries directly
    // This would need to be implemented with a fetch + delete pattern
    // For now, we'll log the intent
    console.log(`Would delete chat history for ${userId} older than ${olderThanDays} days`);
    
    // In production, implement:
    // 1. Query all messages for user
    // 2. Filter by timestamp
    // 3. Delete by IDs

    return 0;
  } catch (error) {
    console.error('Error deleting old chat history:', error);
    return 0;
  }
}

/**
 * Get chat statistics for a user
 */
export async function getChatStatistics(
  userId: string
): Promise<{
  totalChats: number;
  byCategory: Record<string, number>;
  recentActivity: { date: string; count: number }[];
}> {
  try {
    const recentChats = await retrieveChatHistory(userId, 100);

    const byCategory: Record<string, number> = {
      finance: 0,
      career: 0,
      daily_task: 0,
    };

    recentChats.forEach((chat) => {
      byCategory[chat.category] = (byCategory[chat.category] || 0) + 1;
    });

    // Group by date
    const byDate: Record<string, number> = {};
    recentChats.forEach((chat) => {
      const date = new Date(chat.timestamp).toISOString().split('T')[0];
      byDate[date] = (byDate[date] || 0) + 1;
    });

    const recentActivity = Object.entries(byDate)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);

    return {
      totalChats: recentChats.length,
      byCategory,
      recentActivity,
    };
  } catch (error) {
    console.error('Error getting chat statistics:', error);
    return {
      totalChats: 0,
      byCategory: {},
      recentActivity: [],
    };
  }
}

