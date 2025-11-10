// API: Reveal real name in peer connection
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  console.log('👤 [REVEAL NAME] Starting name reveal process...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ [REVEAL NAME] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await request.json();
    
    if (!connectionId) {
      console.log('❌ [REVEAL NAME] Missing connection ID');
      return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 });
    }

    console.log('📝 [REVEAL NAME] Connection ID:', connectionId);

    // Get the connection to determine which user is revealing
    const { data: connection, error: fetchError } = await supabase
      .from('peer_connections')
      .select('user1_id, user2_id, user1_revealed_name, user2_revealed_name')
      .eq('id', connectionId)
      .single();

    if (fetchError || !connection) {
      console.error('❌ [REVEAL NAME] Connection not found:', fetchError);
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Verify user is part of this connection
    if (connection.user1_id !== userId && connection.user2_id !== userId) {
      console.log('❌ [REVEAL NAME] Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Determine which field to update
    const isUser1 = connection.user1_id === userId;
    const updateField = isUser1 ? 'user1_revealed_name' : 'user2_revealed_name';
    const timestampField = isUser1 ? 'user1_revealed_at' : 'user2_revealed_at';

    // Check if already revealed
    const alreadyRevealed = isUser1 ? connection.user1_revealed_name : connection.user2_revealed_name;
    if (alreadyRevealed) {
      console.log('⚠️ [REVEAL NAME] Name already revealed');
      return NextResponse.json({ 
        success: true,
        message: 'Name already revealed',
        alreadyRevealed: true
      });
    }

    // Update the connection to mark name as revealed
    const { error: updateError } = await supabase
      .from('peer_connections')
      .update({
        [updateField]: true,
        [timestampField]: new Date().toISOString(),
      })
      .eq('id', connectionId);

    if (updateError) {
      console.error('❌ [REVEAL NAME] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to reveal name' }, { status: 500 });
    }

    console.log('✅ [REVEAL NAME] Name revealed successfully');

    return NextResponse.json({ 
      success: true,
      message: 'Name revealed successfully',
    });
  } catch (error: any) {
    console.error('❌ [REVEAL NAME] Error:', error);
    return NextResponse.json(
      { error: 'Failed to reveal name', details: error?.message },
      { status: 500 }
    );
  }
}
