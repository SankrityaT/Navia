// BACKEND: Save onboarding data to Clerk and Pinecone
// TODO: Validate input data
// TODO: Generate embeddings for profile data
// TODO: Handle errors and return proper status codes

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

    // TODO: Enable when Pinecone is set up
    // Create embedding for user profile
    // const profileText = `User: ${name}, graduated from ${university} on ${graduation_date}. 
    //     EF challenges: ${Object.entries(ef_profile).filter(([_, v]) => v).map(([k]) => k).join(', ')}.
    //     Current goals: ${Object.entries(current_goals).filter(([_, v]) => v).map(([k]) => k).join(', ')}.`;
    
    // const embedding = await generateEmbedding(profileText);

    // Store in Pinecone
    // await storeUserProfile(
    //   userId,
    //   {
    //     name,
    //     graduation_date,
    //     university,
    //     ef_profile,
    //     current_goals,
    //   },
    //   embedding
    // );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json({ error: 'Failed to save onboarding data' }, { status: 500 });
  }
}
