// API Route: Chat History from Supabase
// Retrieve chat conversations for display and context

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getChatHistory, getChatStatistics } from '@/lib/supabase/operations';

/**
 * GET: Retrieve chat history for the authenticated user
 * Query params:
 *   - limit: number of messages (default: 50)
 *   - category: filter by category (optional)
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const category = searchParams.get('category') as 'finance' | 'career' | 'daily_task' | null;

    // Fetch chat history from Supabase
    const chatHistory = await getChatHistory(
      userId,
      limit,
      category || undefined
    );

    // Get statistics
    const stats = await getChatStatistics(userId);

    return NextResponse.json({
      success: true,
      chatHistory,
      stats,
      count: chatHistory.length,
    });

  } catch (error) {
    console.error('Chat history retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
}

