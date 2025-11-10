// API: Unblock a user
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('✅ [UNBLOCK USER] Starting...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blockedUserId } = await request.json();
    
    if (!blockedUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Remove from blocked_users table
    const { error } = await supabase
      .from('blocked_users')
      .delete()
      .eq('blocker_id', userId)
      .eq('blocked_id', blockedUserId);

    if (error) {
      console.error('❌ [UNBLOCK USER] Error:', error);
      return NextResponse.json({ error: 'Failed to unblock user' }, { status: 500 });
    }

    console.log('✅ [UNBLOCK USER] User unblocked successfully');

    return NextResponse.json({ 
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error: any) {
    console.error('❌ [UNBLOCK USER] Error:', error);
    return NextResponse.json(
      { error: 'Failed to unblock user', details: error?.message },
      { status: 500 }
    );
  }
}
