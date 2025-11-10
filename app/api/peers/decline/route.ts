// API: Decline connection request
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('❌ [DECLINE CONNECTION] Starting decline process...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ [DECLINE CONNECTION] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await request.json();
    
    if (!connectionId) {
      console.log('❌ [DECLINE CONNECTION] Missing connection ID');
      return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 });
    }

    console.log('📝 [DECLINE CONNECTION] Connection ID:', connectionId);

    // Delete the connection request from Supabase
    const { error } = await supabase
      .from('peer_connections')
      .delete()
      .eq('id', connectionId)
      .eq('user2_id', userId); // Only allow user2 (recipient) to decline

    if (error) {
      console.error('❌ [DECLINE CONNECTION] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to decline connection' }, { status: 500 });
    }

    console.log('✅ [DECLINE CONNECTION] Connection declined successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Connection request declined.',
    });
  } catch (error: any) {
    console.error('❌ [DECLINE CONNECTION] Error:', error);
    return NextResponse.json(
      { error: 'Failed to decline connection', details: error?.message },
      { status: 500 }
    );
  }
}
