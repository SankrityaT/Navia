// API Route: Chat Message Feedback
// Handles thumbs up/down feedback for AI responses with toggle count tracking

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateChatMessageFeedback } from '@/lib/supabase/operations';

/**
 * POST /api/chat/feedback
 * 
 * Store user feedback (helpful/not helpful) for a chat message
 * Allows 2 total selections (first click + one change), then locks feedback
 * 
 * Body:
 * {
 *   message_id: string (Supabase UUID),
 *   feedback: boolean (true = helpful, false = not helpful, null = remove)
 * }
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message_id, feedback } = body;

    // Validate inputs
    if (!message_id || typeof message_id !== 'string') {
      return NextResponse.json(
        { error: 'Message ID is required and must be a string' },
        { status: 400 }
      );
    }

    // Allow boolean or null (to remove feedback)
    if (feedback !== null && typeof feedback !== 'boolean') {
      return NextResponse.json(
        { error: 'Feedback must be a boolean (true = helpful, false = not helpful) or null (to remove)' },
        { status: 400 }
      );
    }

    console.log(`📊 Updating feedback: message_id=${message_id}, feedback=${feedback === null ? 'null (remove)' : feedback ? 'helpful' : 'not helpful'}, user=${userId}`);

    // Update feedback with toggle count tracking
    const result = await updateChatMessageFeedback(message_id, userId, feedback);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          locked: result.locked,
          message: result.message,
          toggleCount: result.toggleCount,
        },
        { status: 403 }
      );
    }

    console.log(`✅ Feedback updated: message ${message_id}, toggleCount: ${result.toggleCount}, locked: ${result.locked}`);

    return NextResponse.json({
      success: true,
      feedback: result.feedback,
      locked: result.locked,
      toggleCount: result.toggleCount,
    });

  } catch (error: any) {
    console.error('❌ Feedback API error:', error);
    
    // Handle specific error messages
    if (error.message === 'Message not found') {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to update feedback', success: false },
      { status: 500 }
    );
  }
}

