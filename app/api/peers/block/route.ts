// API: Block a user
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('🚫 [BLOCK USER] Starting...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId, blockedUserId } = await request.json();
    
    if (!connectionId || !blockedUserId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // End the connection
    await supabase
      .from('peer_connections')
      .update({ status: 'ended' })
      .eq('id', connectionId);

    // Create blocked_users table entry (you'll need to create this table)
    const { error } = await supabase
      .from('blocked_users')
      .insert({
        blocker_id: userId,
        blocked_id: blockedUserId,
        blocked_at: new Date().toISOString(),
      });

    if (error && error.code !== '23505') { // Ignore duplicate errors
      console.error('❌ [BLOCK USER] Error:', error);
      return NextResponse.json({ error: 'Failed to block user' }, { status: 500 });
    }

    console.log('✅ [BLOCK USER] User blocked successfully');

    return NextResponse.json({ 
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error: any) {
    console.error('❌ [BLOCK USER] Error:', error);
    return NextResponse.json(
      { error: 'Failed to block user', details: error?.message },
      { status: 500 }
    );
  }
}
