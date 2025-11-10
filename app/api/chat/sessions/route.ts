// API Route: Chat Sessions List
// Returns list of user's chat sessions for sidebar display

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getChatSessions } from '@/lib/supabase/operations';

/**
 * GET: Retrieve list of chat sessions for the authenticated user
 * Query params:
 *   - limit: number of sessions (default: 10)
 */
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    console.log(`📋 Fetching chat sessions for user ${userId}, limit: ${limit}`);

    // Fetch sessions from Supabase
    const sessions = await getChatSessions(userId, limit);

    console.log(`✅ Found ${sessions.length} sessions`);

    return NextResponse.json({
      success: true,
      sessions,
      count: sessions.length,
    });

  } catch (error) {
    console.error('❌ Chat sessions retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve chat sessions' },
      { status: 500 }
    );
  }
}

