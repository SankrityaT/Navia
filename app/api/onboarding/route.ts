// BACKEND: Save onboarding data to Clerk and Pinecone
// Handles neurotypes, EF challenges, goals, and graduation timeline

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { storeUserProfile } from '@/lib/pinecone/operations';
import { generateEmbedding } from '@/lib/embeddings/client';
import { upsertUserProfile } from '@/lib/supabase/operations';
import { getSmartDefaults } from '@/lib/peer-matching/smart-defaults';

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
      current_goal,      // Legacy: single goal (for backwards compatibility)
      current_goals,     // New: multiple goals
      job_field,
      graduation_timeline,
      interests, // Optional from step 5
      seeking,   // Optional from step 5
    } = data;

    // Support both single and multiple goals
    const goalsArray = current_goals || (current_goal ? [current_goal] : []);
    const primaryGoal = goalsArray[0] || current_goal;

    // Validate required fields
    if (!neurotypes || !ef_challenges || (!current_goal && !current_goals) || !graduation_timeline) {
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

    // Store peer profile for matching
    try {
      const neurotypesArray = Object.entries(neurotypes)
        .filter(([_, v]) => v)
        .map(([k]) => k);
      
      const efChallengesArray = Object.entries(ef_challenges)
        .filter(([_, v]) => v)
        .map(([k]) => k);

      // Calculate months post-grad from graduation_timeline
      const now = new Date();
      let monthsPostGrad = 0;
      
      if (graduation_timeline === 'Graduating this year') {
        // Currently graduating - 0 months
        monthsPostGrad = 0;
      } else if (graduation_timeline === '3-6 months ago') {
        monthsPostGrad = 4; // Average of 3-6
      } else if (graduation_timeline === '6-12 months ago') {
        monthsPostGrad = 9; // Average of 6-12
      } else if (graduation_timeline === '1-2 years ago') {
        monthsPostGrad = 18; // Average of 12-24
      } else if (graduation_timeline === '2+ years ago') {
        monthsPostGrad = 30; // 2.5 years
      } else if (graduation_timeline === 'Never went to college') {
        monthsPostGrad = 0; // Treat as current
      } else {
        // Fallback: try to extract year
        const yearMatch = graduation_timeline.match(/\d{4}/);
        if (yearMatch) {
          const year = parseInt(yearMatch[0]);
          monthsPostGrad = (now.getFullYear() - year) * 12 + now.getMonth();
        }
      }

      // Get smart defaults for interests, seeking, and offers
      const smartDefaults = getSmartDefaults({
        current_goal: primaryGoal,
        ef_challenges: efChallengesArray,
        neurotype: neurotypesArray,
        job_field,
      });

      // Use custom interests/seeking if provided, otherwise use smart defaults
      const finalInterests = interests && interests.length > 0 ? interests : smartDefaults.interests;
      const finalSeeking = seeking && seeking.length > 0 ? seeking : smartDefaults.seeking;

      const peerProfileData = {
        user_id: userId,
        name: userName,
        graduation_year: parseInt(graduation_timeline.match(/\d{4}/)?.[0] || new Date().getFullYear().toString()),
        months_post_grad: monthsPostGrad,
        neurotype: neurotypesArray,
        current_struggles: efChallengesArray,
        career_field: job_field || undefined,
        interests: finalInterests,
        seeking: finalSeeking,
        offers: smartDefaults.offers,
        bio: `${goalsArray.map((g: string) => g.replace(/_/g, ' ')).join(', ')}. ${neurotypesArray.join(', ')} navigating post-grad life.`,
        match_preferences: {
          similar_struggles: true,
          similar_neurotype: 'preferred' as const,
        },
      };

      // Store peer profile by calling internal API
      const peerProfileText = `${peerProfileData.current_struggles.join(' ')} ${peerProfileData.interests.join(' ')} ${peerProfileData.career_field || ''} ${peerProfileData.bio}`;
      const peerEmbedding = await generateEmbedding(peerProfileText);
      
      const { storePeerProfile } = await import('@/lib/pinecone/peers');
      await storePeerProfile(peerProfileData, peerEmbedding);

      console.log(`✅ Peer profile stored in Pinecone for ${userName} (${userId})`);
    } catch (peerError) {
      console.error('Peer profile storage error (non-critical):', peerError);
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
