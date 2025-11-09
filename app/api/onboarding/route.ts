// BACKEND: Save onboarding data to Clerk and Pinecone
// Handles neurotypes, EF challenges, goals, and graduation timeline

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { storeUserProfile } from '@/lib/pinecone/operations';
import { generateEmbedding } from '@/lib/embeddings/client';
import { upsertUserProfile } from '@/lib/supabase/operations';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { 
      neurotypes, 
      other_neurotype,
      ef_challenges, 
      current_goal,
      job_field,
      graduation_timeline 
    } = data;

    // Validate required fields
    if (!neurotypes || !ef_challenges || !current_goal || !graduation_timeline) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user info from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userName = user.firstName || user.username || '';
    const userEmail = user.emailAddresses[0]?.emailAddress || '';

    // Update Clerk user metadata
    await client.users.updateUser(userId, {
      publicMetadata: {
        neurotypes,
        other_neurotype,
        ef_challenges,
        current_goal,
        job_field,
        graduation_timeline,
        onboarded: true,
        onboarded_at: new Date().toISOString(),
      },
    });

    // Save to Supabase
    try {
      await upsertUserProfile({
        clerk_user_id: userId,
        name: userName,
        email: userEmail,
        graduation_timeline,
        neurotypes,
        other_neurotype,
        ef_challenges,
        current_goal,
        job_field,
        onboarded: true,
        onboarded_at: new Date().toISOString(),
      });
      console.log(`✅ User profile saved to Supabase for ${userName} (${userId})`);
    } catch (supabaseError) {
      console.error('Supabase storage error (non-critical):', supabaseError);
    }

    // Create embedding for user profile and store in Pinecone
    try {
      // Extract active EF challenges
      const efChallenges = Object.entries(ef_challenges)
        .filter(([_, v]) => v)
        .map(([k]) => k.replace(/_/g, ' '));
      
      // Extract neurotypes
      const neurotypesArray = Object.entries(neurotypes)
        .filter(([_, v]) => v)
        .map(([k]) => k.replace(/_/g, ' '));

      // Create comprehensive profile text for embedding
      // This helps the AI understand user context in future queries
      const profileText = `User Profile:
Neurotypes: ${neurotypesArray.length > 0 ? neurotypesArray.join(', ') : 'not specified'}.
${other_neurotype ? `Other neurotype: ${other_neurotype}.` : ''}
Executive Function Challenges: ${efChallenges.length > 0 ? efChallenges.join(', ') : 'none specified'}.
These challenges may affect task initiation, time management, organization, and daily planning.
Current Goal: ${current_goal.replace(/_/g, ' ')}.
${job_field ? `Job field of interest: ${job_field}.` : ''}
Graduation Timeline: ${graduation_timeline}.
User is a neurodivergent young adult navigating post-college life transitions.
They benefit from structured guidance, breakdown of complex tasks, and supportive, non-judgmental communication.`;

      // Generate embedding using Pinecone Inference API (1024 dimensions)
      const embedding = await generateEmbedding(profileText);

      // Store profile with embedding in Pinecone
      await storeUserProfile(
        userId,
        {
          name: '', // Will be fetched from Clerk
          graduation_date: graduation_timeline,
          university: '',
          ef_profile: ef_challenges,
          current_goals: { [current_goal]: true },
        },
        embedding
      );

      console.log(`✅ User profile stored in Pinecone for user ${userId}`);
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
