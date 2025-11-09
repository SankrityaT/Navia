// API: Send and retrieve peer messages
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { storeMessage, getMessages } from '@/lib/pinecone/connections';
import { PeerMessage } from '@/lib/types';

// GET: Fetch messages for a connection
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const connectionId = searchParams.get('connectionId');
    
    if (!connectionId) {
      return NextResponse.json({ error: 'Connection ID required' }, { status: 400 });
    }

    const messages = await getMessages(connectionId);

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST: Send a new message
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId, content } = await request.json();
    
    if (!connectionId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const message: PeerMessage = {
      message_id: `msg_${Date.now()}_${userId}`,
      connection_id: connectionId,
      sender_id: userId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    await storeMessage(message);

    return NextResponse.json({ 
      success: true,
      message 
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
