// API: Create connection request
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('🔗 [CONNECT] Creating connection request...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ [CONNECT] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetUserId } = await request.json();
    
    if (!targetUserId) {
      console.log('❌ [CONNECT] Missing target user ID');
      return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    }

    console.log('👤 [CONNECT] From:', userId, 'To:', targetUserId);

    // Create connection in Supabase
    const { data, error } = await supabase
      .from('peer_connections')
      .insert({
        user1_id: userId,
        user2_id: targetUserId,
        status: 'pending',
        initiated_by: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [CONNECT] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
    }

    console.log('✅ [CONNECT] Connection created:', data.id);

    return NextResponse.json({ 
      success: true, 
      connection: data
    });
  } catch (error: any) {
    console.error('❌ [CONNECT] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create connection request', details: error?.message },
      { status: 500 }
    );
  }
}
