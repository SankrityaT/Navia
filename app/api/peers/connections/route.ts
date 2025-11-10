// API: Get user's peer connections (accepted and pending)
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  console.log('🔗 [CONNECTIONS] Fetching user connections...');
  
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('❌ [CONNECTIONS] Unauthorized');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 [CONNECTIONS] User ID:', userId);

    // Fetch connections from peer_connections table
    const { data: connections, error } = await supabase
      .from('peer_connections')
      .select(`
        id,
        status,
        created_at,
        last_checkin,
        user1_id,
        user2_id,
        initiated_by
      `)
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [CONNECTIONS] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }

    console.log('📊 [CONNECTIONS] Found', connections?.length || 0, 'connections');

    // For each connection, fetch the peer's profile
    const connectionsWithProfiles = await Promise.all(
      (connections || []).map(async (conn) => {
        const peerId = conn.user1_id === userId ? conn.user2_id : conn.user1_id;
        
        // Fetch peer profile from Supabase
        const { data: peerProfile } = await supabase
          .from('user_profiles')
          .select('name, neurotypes, ef_challenges, current_goal')
          .eq('clerk_user_id', peerId)
          .single();

        if (!peerProfile) {
          return null;
        }

        // Parse JSON fields
        const neurotypes = peerProfile.neurotypes || {};
        const efChallenges = peerProfile.ef_challenges || {};
        
        const neurotypesArray = Object.entries(neurotypes)
          .filter(([_, v]) => v)
          .map(([k]) => k);
        
        const efChallengesArray = Object.entries(efChallenges)
          .filter(([_, v]) => v)
          .map(([k]) => k);

        return {
          id: conn.id,
          peer_id: peerId,
          peer_name: peerProfile.name,
          peer_bio: `${peerProfile.current_goal?.replace(/_/g, ' ')}. ${neurotypesArray.join(', ')} navigating post-grad life.`,
          neurotype: neurotypesArray,
          shared_struggles: efChallengesArray,
          status: conn.status,
          created_at: conn.created_at,
          last_checkin: conn.last_checkin,
          initiated_by: conn.initiated_by,
        };
      })
    );

    const validConnections = connectionsWithProfiles.filter(c => c !== null);
    console.log('✅ [CONNECTIONS] Returning', validConnections.length, 'connections with profiles');

    return NextResponse.json({ 
      connections: validConnections,
      count: validConnections.length
    });
  } catch (error: any) {
    console.error('❌ [CONNECTIONS] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch connections',
      details: error?.message 
    }, { status: 500 });
  }
}
