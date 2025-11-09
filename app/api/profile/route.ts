// API Route: User Profile Management
// Retrieve and update user profiles from Pinecone

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile } from '@/lib/pinecone/operations';
import { generateEmbedding } from '@/lib/embeddings/client';

// GET: Retrieve user profile from Pinecone
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve profile from Pinecone
    const profile = await getUserProfile(userId);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found', onboarded: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });

  } catch (error) {
    console.error('Profile retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

// PATCH: Update user profile
export async function PATCH(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const { name, graduation_date, university, ef_profile, current_goals } = updates;

    // If profile data changed significantly, regenerate embedding
    let newEmbedding: number[] | undefined;
    if (ef_profile || current_goals) {
      const efChallenges = ef_profile
        ? Object.entries(ef_profile)
            .filter(([_, v]) => v)
            .map(([k]) => k.replace(/_/g, ' '))
        : [];
      
      const goals = current_goals
        ? Object.entries(current_goals)
            .filter(([_, v]) => v)
            .map(([k]) => k.replace(/_/g, ' '))
        : [];

      const profileText = `User Profile: ${name || 'user'}
Background: Graduated from ${university || 'university'} on ${graduation_date || 'recent graduate'}.
Executive Function Challenges: ${efChallenges.length > 0 ? efChallenges.join(', ') : 'none specified'}.
These challenges may affect task initiation, time management, organization, and daily planning.
Current Life Goals: ${goals.length > 0 ? goals.join(', ') : 'exploring options'}.
User is a neurodivergent young adult navigating post-college life transitions.
They benefit from structured guidance, breakdown of complex tasks, and supportive, non-judgmental communication.`;

      newEmbedding = await generateEmbedding(profileText);
    }

    // Update profile in Pinecone
    await updateUserProfile(
      userId,
      {
        ...(name && { name }),
        ...(graduation_date && { graduation_date }),
        ...(university && { university }),
        ...(ef_profile && { ef_profile }),
        ...(current_goals && { current_goals }),
      },
      newEmbedding
    );

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

