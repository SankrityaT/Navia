// BACKEND: Peer network API
// TODO: Add connection management
// TODO: Implement group creation
// TODO: Add messaging system

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { findPeerMatches, storePeerProfile } from '@/lib/pinecone/peers';
import { generateEmbedding } from '@/lib/openai/client';
import { PeerProfile } from '@/lib/types';

// GET: Find matching peers
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Fetch user's peer profile from Pinecone
    const mockUserProfile: PeerProfile = {
      user_id: userId,
      name: 'Current User',
      graduation_year: 2024,
      months_post_grad: 6,
      neurotype: ['ADHD'],
      current_struggles: ['job_searching', 'time_management'],
      career_field: 'software_engineering',
      interests: ['coding', 'gaming', 'coffee'],
      seeking: ['accountability_partner', 'career_networking'],
      bio: 'Looking for support in job search',
      match_preferences: {
        similar_struggles: true,
        similar_neurotype: 'preferred',
      },
    };

    const matches = await findPeerMatches(userId, mockUserProfile, 10);

    return NextResponse.json({ matches });
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
