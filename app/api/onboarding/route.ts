// BACKEND: Save onboarding data to Clerk and Pinecone
// Handles neurotypes, EF challenges, goals, and graduation timeline

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { storeUserProfile } from '@/lib/pinecone/operations';
import { generateEmbedding } from '@/lib/openai/client';

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

    // Update Clerk user metadata
    const client = await clerkClient();
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

    // TODO: Enable when Pinecone is set up
    // Create embedding for user profile
    // const selectedNeurotypes = Object.entries(neurotypes)
    //   .filter(([_, v]) => v)
    //   .map(([k]) => k.replace(/_/g, ' '))
    //   .join(', ');
    
    // const selectedEfChallenges = Object.entries(ef_challenges)
    //   .filter(([_, v]) => v)
    //   .map(([k]) => k.replace(/_/g, ' '))
    //   .join(', ');
    
    // const profileText = `User profile: 
    //   Neurotypes: ${selectedNeurotypes}${other_neurotype ? ` (${other_neurotype})` : ''}. 
    //   Executive function challenges: ${selectedEfChallenges}. 
    //   Current goal: ${current_goal.replace(/_/g, ' ')}${job_field ? ` in ${job_field}` : ''}. 
    //   Graduation timeline: ${graduation_timeline}.`;
    
    // const embedding = await generateEmbedding(profileText);

    // Store in Pinecone
    // await storeUserProfile(
    //   userId,
    //   {
    //     neurotypes,
    //     other_neurotype,
    //     ef_challenges,
    //     current_goal,
    //     job_field,
    //     graduation_timeline,
    //   },
    //   embedding
    // );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}
