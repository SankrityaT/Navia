// API Route: User Statistics
// Get user count and other stats from Supabase

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/client';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total user count
    const { count: totalUsers, error: countError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error counting users:', countError);
      throw countError;
    }

    // Get onboarded user count
    const { count: onboardedUsers, error: onboardedError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('onboarded', true);

    if (onboardedError) {
      console.error('Error counting onboarded users:', onboardedError);
      throw onboardedError;
    }

    // Get recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentSignups, error: recentError } = await supabaseAdmin
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (recentError) {
      console.error('Error counting recent signups:', recentError);
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        onboardedUsers: onboardedUsers || 0,
        recentSignups: recentSignups || 0,
      },
    });

  } catch (error) {
    console.error('User stats error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve user statistics' },
      { status: 500 }
    );
  }
}
