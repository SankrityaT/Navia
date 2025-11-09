// API: Create connection request
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createConnectionRequest } from '@/lib/pinecone/connections';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await request.json();
    
    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    const connection = await createConnectionRequest(userId, targetUserId);

    return NextResponse.json({ 
      success: true, 
      connection 
    });
  } catch (error) {
    console.error('Connection request error:', error);
    return NextResponse.json(
      { error: 'Failed to create connection request' },
      { status: 500 }
    );
  }
}
