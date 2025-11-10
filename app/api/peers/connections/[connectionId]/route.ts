// API: Get specific connection info
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ connectionId: string }> }
) {
  console.log('🔗 [CONNECTION INFO] Fetching connection...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ [CONNECTION INFO] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId } = await params;
    console.log('📝 [CONNECTION INFO] Connection ID:', connectionId);

    // Fetch connection
    const { data: connection, error } = await supabase
      .from('peer_connections')
      .select('*')
      .eq('id', connectionId)
      .single();

    if (error || !connection) {
      console.error('❌ [CONNECTION INFO] Connection not found:', error);
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    // Verify user is part of this connection
    if (connection.user1_id !== userId && connection.user2_id !== userId) {
      console.log('❌ [CONNECTION INFO] Unauthorized access');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get peer ID (the other user in the connection)
    const peerId = connection.user1_id === userId ? connection.user2_id : connection.user1_id;
    const isUser1 = connection.user1_id === userId;

    // Fetch peer profile
    const { data: peerProfile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('clerk_user_id', peerId)
      .single();

    // Check if peer has revealed their name
    const peerRevealed = isUser1 ? connection.user2_revealed_name : connection.user1_revealed_name;
    const displayName = peerRevealed ? peerProfile?.name : null;

    console.log('✅ [CONNECTION INFO] Connection found');

    return NextResponse.json({ 
      connection: {
        id: connection.id,
        peer_id: peerId,
        peer_name: displayName, // null if not revealed, real name if revealed
        status: connection.status,
        created_at: connection.created_at,
        peer_revealed: peerRevealed || false,
      }
    });
  } catch (error: any) {
    console.error('❌ [CONNECTION INFO] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch connection',
      details: error?.message 
    }, { status: 500 });
  }
}
