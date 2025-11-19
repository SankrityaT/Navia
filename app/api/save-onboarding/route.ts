import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userName, responses, preferredMode } = await req.json();

    // 1. Save onboarding data to Clerk user metadata
    try {
      const client = await clerkClient();
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          onboardingCompleted: true,
          onboardingCompletedAt: new Date().toISOString(),
          onboardingName: userName, // Store preferred name in public metadata for client access
        },
        privateMetadata: {
          onboardingData: {
            userName,
            responses,
            preferredMode,
            completedAt: new Date().toISOString(),
          },
        },
      });
      
      console.log('✅ Onboarding data saved to Clerk metadata');
    } catch (clerkError) {
      console.error('Clerk metadata error:', clerkError);
      // Don't fail - continue to Supabase
    }

    // 2. Update Supabase user_profiles to mark onboarding complete
    // This is CRITICAL for middleware to allow dashboard access
    try {
      const { error: supabaseError } = await supabase
        .from('user_profiles')
        .upsert({
          clerk_user_id: userId,
          name: userName || 'User', // Required field
          onboarded: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'clerk_user_id'
        });

      if (supabaseError) {
        console.error('❌ Supabase error:', supabaseError);
        throw supabaseError; // Throw so we know it failed
      } else {
        console.log('✅ Onboarding flag set in Supabase (name:', userName, ', onboarded: true)');
      }
    } catch (supabaseError) {
      console.error('❌ Supabase update error:', supabaseError);
      // Don't fail - user can still proceed
    }

    // TODO: Save to Pinecone for RAG context if needed

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Save onboarding error:', error);
    // Return success anyway - don't block user from accessing dashboard
    return NextResponse.json({ success: true, warning: 'Partial save' });
  }
}
