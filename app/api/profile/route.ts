// API Route: User Profile Management
// Retrieve and update user profiles from Supabase (primary) and Pinecone (embeddings)

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { getUserProfile as getPineconeProfile, updateUserProfile } from '@/lib/pinecone/operations';
import { generateEmbedding } from '@/lib/embeddings/client';
import { getUserProfile, upsertUserProfile } from '@/lib/supabase/operations';
import { supabaseAdmin } from '@/lib/supabase/client';

// GET: Retrieve user profile from Supabase
export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve profile from Supabase
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
      onboarded: profile.onboarded || false,
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

// POST: Comprehensive profile update (from edit page)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();
    const {
      neurotypes,
      ef_challenges,
      current_goals,
      job_field,
      graduation_timeline,
      interests,
      seeking,
      offers
    } = updates;

    // Support both single and multiple goals for backwards compatibility
    const goalsArray = current_goals || [];
    const primaryGoal = goalsArray.length > 0 ? goalsArray[0] : '';

    console.log('📝 [PROFILE UPDATE] Comprehensive update for user:', userId);
    console.log('📊 [PROFILE UPDATE] Data:', {
      neurotypes: neurotypes ? Object.keys(neurotypes).length : 0,
      ef_challenges: ef_challenges ? Object.keys(ef_challenges).length : 0,
      current_goals: goalsArray.length,
      job_field,
      graduation_timeline,
      interests: interests?.length || 0,
      seeking: seeking?.length || 0,
      offers: offers?.length || 0,
    });

    // Calculate months post-grad from graduation timeline
    const now = new Date();
    let monthsPostGrad = 0;
    
    if (graduation_timeline === 'Graduating this year') {
      monthsPostGrad = 0;
    } else if (graduation_timeline === '3-6 months ago') {
      monthsPostGrad = 4;
    } else if (graduation_timeline === '6-12 months ago') {
      monthsPostGrad = 9;
    } else if (graduation_timeline === '1-2 years ago') {
      monthsPostGrad = 18;
    } else if (graduation_timeline === '2+ years ago') {
      monthsPostGrad = 30;
    } else if (graduation_timeline === 'Never went to college') {
      monthsPostGrad = 0;
    } else {
      const yearMatch = graduation_timeline.match(/\d{4}/);
      if (yearMatch) {
        const year = parseInt(yearMatch[0]);
        monthsPostGrad = (now.getFullYear() - year) * 12 + now.getMonth();
      }
    }

    // Update Supabase profile
    await upsertUserProfile({
      clerk_user_id: userId,
      name: '', // Will be fetched from Clerk
      email: '', // Will be fetched from Clerk
      graduation_timeline,
      neurotypes,
      other_neurotype: '', // Not collecting this in edit
      ef_challenges,
      current_goal: primaryGoal, // Use first goal as primary
      current_goals: goalsArray, // Save the full array
      job_field: job_field || undefined,
      interests, // Include in main upsert
      seeking,   // Include in main upsert
      offers,    // Include in main upsert
      onboarded: true,
      onboarded_at: undefined, // Will be set automatically if new
    });

    console.log('✅ [PROFILE UPDATE] Supabase profile updated successfully');

    // Update Pinecone peer profile if peer data changed
    if (interests || seeking || offers) {
      console.log('🔄 [PROFILE UPDATE] Updating Pinecone peer profile...');

      // Generate new embedding for peer matching
      const profileText = `${Object.entries(ef_challenges).filter(([_, v]) => v).map(([k]) => k).join(' ')} ${interests.join(' ')} ${job_field || ''}`;
      const embedding = await generateEmbedding(profileText);

      // Create/update peer profile in Pinecone
      const { storePeerProfile } = await import('@/lib/pinecone/peers');
      await storePeerProfile({
        user_id: userId,
        name: '', // Will be fetched
        graduation_year: new Date().getFullYear(),
        months_post_grad: monthsPostGrad, // Use calculated value, not 0
        neurotype: Object.entries(neurotypes).filter(([_, v]) => v).map(([k]) => k),
        current_struggles: Object.entries(ef_challenges).filter(([_, v]) => v).map(([k]) => k),
        career_field: job_field,
        interests: interests || [],
        seeking: seeking || [],
        offers: offers || [],
        bio: `${current_goals.join(', ')}. ${Object.entries(neurotypes).filter(([_, v]) => v).map(([k]) => k).join(', ')} navigating post-grad life.`,
        match_preferences: {
          similar_struggles: true,
          similar_neurotype: 'preferred',
        },
      }, embedding);

      console.log('✅ [PROFILE UPDATE] Pinecone peer profile updated');
    }

    console.log('✅ [PROFILE UPDATE] Comprehensive profile update successful');

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
    });

  } catch (error: any) {
    console.error('❌ [PROFILE UPDATE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile', details: error?.message },
      { status: 500 }
    );
  }
}

