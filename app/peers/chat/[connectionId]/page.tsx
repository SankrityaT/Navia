'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import PeerChatInterface from '@/components/peers/PeerChatInterface';
import { generateAnonymousName } from '@/lib/utils/anonymousNames';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ConnectionInfo {
  peer_id: string;
  peer_name: string | null;
  status: string;
  peer_revealed?: boolean;
}

export default function PeerChatPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params.connectionId as string;
  
  const [loading, setLoading] = useState(true);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConnectionInfo();
  }, [connectionId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (data.profile?.clerk_user_id) {
        setCurrentUserId(data.profile.clerk_user_id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConnectionInfo = async () => {
    try {
      const response = await fetch(`/api/peers/connections/${connectionId}`);
      const data = await response.json();
      if (data.connection) {
        setConnectionInfo(data.connection);
      }
    } catch (error) {
      console.error('Error fetching connection info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--clay-500)]" />
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!connectionInfo || !currentUserId) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--clay-500)]" />
        </div>
      </AuthenticatedLayout>
    );
  }

  // Use real name if revealed, otherwise anonymous name
  const peerName = connectionInfo.peer_name || generateAnonymousName(connectionInfo.peer_id);
  
  // Create a connection object for PeerChatInterface
  const connection = {
    connection_id: connectionId,
    user1_id: connectionInfo.peer_id,
    user2_id: currentUserId,
    status: connectionInfo.status,
  };

  return (
    <AuthenticatedLayout>
      <div className="fixed inset-0 top-16">
        <PeerChatInterface
          connection={connection as any}
          currentUserId={currentUserId}
          peerName={peerName}
          peerRevealed={connectionInfo.peer_revealed}
        />
      </div>
    </AuthenticatedLayout>
  );
}
