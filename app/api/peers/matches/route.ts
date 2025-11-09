// API: Get peer matches for current user
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { findPeerMatches } from '@/lib/pinecone/peers';
import { PeerProfile } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userProfile } = await request.json();
    
    if (!userProfile) {
      return NextResponse.json({ error: 'User profile required' }, { status: 400 });
    }

    const matches = await findPeerMatches(userId, userProfile as PeerProfile, 10);

    return NextResponse.json({ matches });
  } catch (error) {
    console.error('Find matches error:', error);
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}
