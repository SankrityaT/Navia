// API: Accept connection and set mutual goals
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { acceptConnection } from '@/lib/pinecone/connections';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId, myGoals, theirGoals } = await request.json();
    
    if (!connectionId || !myGoals || !theirGoals) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await acceptConnection(connectionId, myGoals, theirGoals);

    return NextResponse.json({ 
      success: true,
      message: 'Connection accepted! Your accountability partnership is now active.' 
    });
  } catch (error) {
    console.error('Accept connection error:', error);
    return NextResponse.json(
      { error: 'Failed to accept connection' },
      { status: 500 }
    );
  }
}
