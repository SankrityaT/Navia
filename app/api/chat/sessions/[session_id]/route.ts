// API Route: Get Specific Session Messages
// Returns all messages for a specific session

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getSessionMessages } from '@/lib/supabase/operations';

/**
 * GET: Retrieve all messages for a specific session
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ session_id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = await params;

    if (!session_id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log(`📋 Fetching messages for session ${session_id}, user ${userId}`);

    // Fetch session messages from Supabase
    const messages = await getSessionMessages(userId, session_id);

    console.log(`✅ Found ${messages?.length || 0} messages for session`);

    if (!messages || messages.length === 0) {
      console.warn(`⚠️ Session ${session_id} not found or empty`);
      return NextResponse.json(
        { error: 'Session not found or empty' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session_id,
      session_title: messages[0]?.session_title || 'Chat Session',
      category: messages[0]?.category || 'daily_task',
      messages,
      count: messages.length,
    });

  } catch (error) {
    console.error('❌ Session messages retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve session messages' },
      { status: 500 }
    );
  }
}

