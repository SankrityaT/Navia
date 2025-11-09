// API: Accept connection and set mutual goals
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('✅ [ACCEPT CONNECTION] Starting acceptance process...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ [ACCEPT CONNECTION] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId, myGoals } = await request.json();
    
    if (!connectionId || !myGoals) {
      console.log('❌ [ACCEPT CONNECTION] Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('📝 [ACCEPT CONNECTION] Connection ID:', connectionId);
    console.log('🎯 [ACCEPT CONNECTION] My goals:', myGoals);

    // Update connection status to accepted in Supabase
    const { data, error } = await supabase
      .from('peer_connections')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        user2_goals: myGoals, // Assuming user2 is the one accepting
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      console.error('❌ [ACCEPT CONNECTION] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update connection' }, { status: 500 });
    }

    console.log('✅ [ACCEPT CONNECTION] Connection accepted successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Connection accepted! Your accountability partnership is now active.',
      connection: data
    });
  } catch (error: any) {
    console.error('❌ [ACCEPT CONNECTION] Error:', error);
    return NextResponse.json(
      { error: 'Failed to accept connection', details: error?.message },
      { status: 500 }
    );
  }
}
