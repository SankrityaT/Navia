// BACKEND: Save onboarding data to Clerk and Pinecone
// TODO: Validate input data
// TODO: Generate embeddings for profile data
// TODO: Handle errors and return proper status codes

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { storeUserProfile } from '@/lib/pinecone/operations';
import { generateEmbedding } from '@/lib/embeddings/client';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, graduation_date, university, ef_profile, current_goals } = data;

    // Update Clerk user metadata
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        name,
        graduation_date,
        university,
        ef_profile,
        current_goals,
        onboarded: true,
      },
    });

    // Create embedding for user profile and store in Pinecone
    try {
      // Extract active EF challenges and goals
      const efChallenges = Object.entries(ef_profile)
        .filter(([_, v]) => v)
        .map(([k]) => k.replace(/_/g, ' '));
      
      const goals = Object.entries(current_goals)
        .filter(([_, v]) => v)
        .map(([k]) => k.replace(/_/g, ' '));

      // Create comprehensive profile text for embedding
      // This helps the AI understand user context in future queries
      const profileText = `User Profile: ${name}
Background: Graduated from ${university || 'university'} on ${graduation_date || 'recent graduate'}.
Executive Function Challenges: ${efChallenges.length > 0 ? efChallenges.join(', ') : 'none specified'}.
These challenges may affect task initiation, time management, organization, and daily planning.
Current Life Goals: ${goals.length > 0 ? goals.join(', ') : 'exploring options'}.
User is a neurodivergent young adult navigating post-college life transitions.
They benefit from structured guidance, breakdown of complex tasks, and supportive, non-judgmental communication.`;

      // Generate embedding using Pinecone Inference API (1024 dimensions)
      const embedding = await generateEmbedding(profileText);

      // Store profile with embedding in Pinecone
      await storeUserProfile(
        userId,
        {
          name,
          graduation_date: graduation_date || '',
          university: university || '',
          ef_profile,
          current_goals,
        },
        embedding
      );

      console.log(`✅ User profile stored in Pinecone for ${name} (${userId})`);
    } catch (pineconeError) {
      // Log error but don't fail the onboarding
      // User can still use the app even if Pinecone storage fails
      console.error('Pinecone storage error (non-critical):', pineconeError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Onboarding complete! Your profile has been saved.',
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}
