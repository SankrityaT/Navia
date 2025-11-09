// BACKEND: Peer network API
// TODO: Add connection management
// TODO: Implement group creation
// TODO: Add messaging system

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findPeerMatches, storePeerProfile, getPeerProfile } from '@/lib/pinecone/peers';
import { generateEmbedding } from '@/lib/embeddings/client';
import type { PeerProfile } from '@/lib/types';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Find matching peers
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's peer profile from Pinecone
    const { getPeerProfile } = await import('@/lib/pinecone/peers');
    const userProfile = await getPeerProfile(userId);

    if (!userProfile) {
      // User hasn't completed peer profile yet
      return NextResponse.json({ 
        matches: [],
        hasProfile: false,
        message: 'Complete your profile to start matching'
      });
    }

    // Get existing connections to filter them out
    const { data: connections } = await supabase
      .from('peer_connections')
      .select('user1_id, user2_id')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    // Extract connected user IDs
    const connectedUserIds = new Set(
      (connections || []).flatMap(conn => [conn.user1_id, conn.user2_id])
    );
    connectedUserIds.delete(userId); // Remove self

    // Find matches
    const allMatches = await findPeerMatches(userId, userProfile, 10);
    
    // Filter out already-connected peers
    const matches = allMatches.filter(match => !connectedUserIds.has(match.peer.user_id));

    return NextResponse.json({ 
      matches,
      hasProfile: true
    });
  } catch (error) {
    console.error('Peer matching error:', error);
    return NextResponse.json({ error: 'Failed to find matches' }, { status: 500 });
  }
}

// POST: Create/update peer profile
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileData: PeerProfile = await request.json();
    profileData.user_id = userId;

    // Generate embedding for profile
    const profileText = `${profileData.current_struggles.join(' ')} ${profileData.interests.join(' ')} ${profileData.career_field || ''} ${profileData.bio}`;
    const embedding = await generateEmbedding(profileText);

    await storePeerProfile(profileData, embedding);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Peer profile creation error:', error);
    return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
  }
}
