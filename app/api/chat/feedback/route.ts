// API Route: Chat Message Feedback
// Handles thumbs up/down feedback for AI responses

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { updateChatMessageFeedback } from '@/lib/supabase/operations';

/**
 * POST: Update feedback for a chat message
 * Body:
 *   - messageId: UUID of the chat message
 *   - feedback: boolean (true = thumbs up, false = thumbs down, null = remove)
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, feedback } = body;

    // Validate input
    if (!messageId || typeof messageId !== 'string') {
      return NextResponse.json(
        { error: 'messageId is required and must be a string' },
        { status: 400 }
      );
    }

    if (feedback !== null && typeof feedback !== 'boolean') {
      return NextResponse.json(
        { error: 'feedback must be a boolean or null' },
        { status: 400 }
      );
    }

    // Update feedback in database
    const result = await updateChatMessageFeedback(messageId, userId, feedback);

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

    return NextResponse.json({
      success: true,
      feedback: result.feedback,
      locked: result.locked,
      toggleCount: result.toggleCount,
    });

  } catch (error: any) {
    console.error('Feedback API error:', error);
    
    // Handle specific error messages
    if (error.message === 'Message not found') {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }
    
    if (error.message?.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to update feedback' },
      { status: 500 }
    );
  }
}

