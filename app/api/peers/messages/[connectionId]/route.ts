// API: Peer messaging - get and send messages
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch messages for a connection
export async function GET(
  request: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  console.log('💬 [MESSAGES] Fetching messages...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ [MESSAGES] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await params;
    console.log('📝 [MESSAGES] Connection ID:', connectionId);

    // Verify user is part of this connection
    const { data: connection } = await supabase
      .from('peer_connections')
      .select('user1_id, user2_id')
      .eq('id', connectionId)
      .single();

    if (!connection || (connection.user1_id !== userId && connection.user2_id !== userId)) {
      console.log('❌ [MESSAGES] Unauthorized access to connection');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Fetch messages
    const { data: messages, error } = await supabase
      .from('peer_messages')
      .select('*')
      .eq('connection_id', connectionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [MESSAGES] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    console.log('✅ [MESSAGES] Returning', messages?.length || 0, 'messages');

    return NextResponse.json({ 
      messages: messages || [],
      count: messages?.length || 0
    });
  } catch (error: any) {
    console.error('❌ [MESSAGES] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch messages',
      details: error?.message 
    }, { status: 500 });
  }
}

// POST: Send a message
export async function POST(
  request: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  console.log('📤 [SEND MESSAGE] Sending message...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ [SEND MESSAGE] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await params;
    const { content } = await request.json();

    if (!content || !content.trim()) {
      console.log('❌ [SEND MESSAGE] Empty message');
      return NextResponse.json({ error: 'Message content required' }, { status: 400 });
    }

    console.log('📝 [SEND MESSAGE] Connection ID:', connectionId);

    // Verify user is part of this connection
    const { data: connection } = await supabase
      .from('peer_connections')
      .select('user1_id, user2_id')
      .eq('id', connectionId)
      .single();

    if (!connection || (connection.user1_id !== userId && connection.user2_id !== userId)) {
      console.log('❌ [SEND MESSAGE] Unauthorized access to connection');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Insert message
    const { data: message, error } = await supabase
      .from('peer_messages')
      .insert({
        connection_id: connectionId,
        sender_id: userId,
        content: content.trim(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [SEND MESSAGE] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    console.log('✅ [SEND MESSAGE] Message sent:', message.id);

    return NextResponse.json({ 
      success: true,
      message
    });
  } catch (error: any) {
    console.error('❌ [SEND MESSAGE] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to send message',
      details: error?.message 
    }, { status: 500 });
  }
}
