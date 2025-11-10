import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

/**
 * POST /api/chat/feedback
 * 
 * Store user feedback (helpful/not helpful) for a chat message
 * 
 * Body:
 * {
 *   message_id: string (Supabase UUID),
 *   feedback: boolean (true = helpful, false = not helpful)
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

    if (typeof feedback !== 'boolean') {
      return NextResponse.json(
        { error: 'Feedback must be a boolean (true = helpful, false = not helpful)' },
        { status: 400 }
      );
    }

    console.log(`📊 Storing feedback: message_id=${message_id}, feedback=${feedback ? 'helpful' : 'not helpful'}, user=${userId}`);

    // Update the message with feedback
    // Also verify that the message belongs to this user (security)
    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .update({ user_feedback: feedback })
      .eq('id', message_id)
      .eq('user_id', userId) // Security: ensure user owns this message
      .select()
      .single();

    if (error) {
      console.error('❌ Error storing feedback:', error);
      
      // Check if message not found or doesn't belong to user
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Message not found or you do not have permission to update it' },
          { status: 404 }
        );
      }
      
      throw error;
    }

    console.log(`✅ Feedback stored successfully: message ${message_id}`);

    return NextResponse.json({
      success: true,
      message: 'Feedback stored successfully',
      data: {
        message_id: data.id,
        user_feedback: data.user_feedback,
      },
    });

  } catch (error) {
    console.error('❌ Feedback API error:', error);
    return NextResponse.json(
      { error: 'Failed to store feedback', success: false },
      { status: 500 }
    );
  }
}

