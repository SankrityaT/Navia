// API: Remove/end a peer connection
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('🗑️ [REMOVE CONNECTION] Starting...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await request.json();
    
    if (!connectionId) {
      return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 });
    }

    // Update connection status to 'ended'
    const { error } = await supabase
      .from('peer_connections')
      .update({ status: 'ended' })
      .eq('id', connectionId)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) {
      console.error('❌ [REMOVE CONNECTION] Error:', error);
      return NextResponse.json({ error: 'Failed to remove connection' }, { status: 500 });
    }

    console.log('✅ [REMOVE CONNECTION] Connection ended successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Connection removed successfully'
    });
  } catch (error: any) {
    console.error('❌ [REMOVE CONNECTION] Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove connection', details: error?.message },
      { status: 500 }
    );
  }
}
