import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserProfile } from '@/lib/supabase/operations';

/**
 * Get user profile from Supabase
 * Returns the user's preferred name from onboarding
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile from Supabase
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      return NextResponse.json({ name: null }, { status: 200 });
    }

    return NextResponse.json({ 
      name: profile.name,
      onboarded: profile.onboarded 
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
