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
  my_revealed?: boolean;
  is_blocked?: boolean;
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

  // Check if blocked
  if (connectionInfo.is_blocked) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 rounded-full bg-[var(--clay-200)] flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🚫</span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-2">
              Chat Unavailable
            </h2>
            <p className="text-[var(--charcoal)]/70 mb-6">
              This conversation is no longer accessible.
            </p>
            <button
              onClick={() => router.push('/connections')}
              className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-xl font-semibold transition-all"
            >
              Back to Connections
            </button>
          </div>
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
          myRevealed={connectionInfo.my_revealed}
        />
      </div>
    </AuthenticatedLayout>
  );
}
