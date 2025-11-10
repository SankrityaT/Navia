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

    // Fetch peer profile
    const { data: peerProfile } = await supabase
      .from('user_profiles')
      .select('name')
      .eq('clerk_user_id', peerId)
      .single();

    console.log('✅ [CONNECTION INFO] Connection found');

    return NextResponse.json({ 
      connection: {
        id: connection.id,
        peer_id: peerId,
        peer_name: peerProfile?.name || 'Peer',
        status: connection.status,
        created_at: connection.created_at,
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
