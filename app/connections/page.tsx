// FRONTEND: Connections page - shows all accepted peer connections
// Different from /peers which shows potential matches

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import ConnectionRequestModal from '@/components/peers/ConnectionRequestModal';
import { Users, MessageCircle, Calendar, CheckCircle, Clock, Sparkles } from 'lucide-react';

interface Connection {
  id: string;
  peer_name: string;
  peer_bio: string;
  neurotype: string[];
  shared_struggles: string[];
  status: 'pending' | 'accepted';
  created_at: string;
  last_checkin?: string;
  initiated_by?: string;
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<Connection | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConnections();
  }, []);

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

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/peers/connections');
      const data = await response.json();
      
      if (data.connections) {
        setConnections(data.connections);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptConnection = async (myGoals: string[]) => {
    if (!selectedRequest) return;
    
    try {
      const response = await fetch('/api/peers/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: selectedRequest.id,
          myGoals,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh connections
        await fetchConnections();
        setSelectedRequest(null);
        alert('Connection accepted! You can now message each other.');
      } else {
        alert('Failed to accept connection. Please try again.');
      }
    } catch (error) {
      console.error('Error accepting connection:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handleDeclineConnection = async () => {
    if (!selectedRequest) return;
    
    // TODO: Implement decline endpoint
    setSelectedRequest(null);
  };

  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const acceptedConnections = connections.filter(c => c.status === 'accepted');
  // Only show pending requests that were sent TO me (not ones I sent)
  const pendingConnections = connections.filter(c => 
    c.status === 'pending' && c.initiated_by !== currentUserId
  );

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--clay-500)]"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 texture-grain"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--sage-100)] rounded-full mb-4">
              <Users className="w-4 h-4 text-[var(--sage-600)]" />
              <span className="text-sm text-[var(--sage-700)] font-medium">Your Network</span>
            </div>
            <h1 className="text-4xl font-serif font-bold text-[var(--charcoal)] mb-3" style={{fontFamily: 'var(--font-fraunces)'}}>
              My Connections
            </h1>
            <p className="text-[var(--charcoal)]/70 text-lg">
              Your accountability partners and peer support network
            </p>
          </div>

          {/* Pending Connections */}
          {pendingConnections.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4 flex items-center gap-2">
                <Clock className="w-6 h-6 text-[var(--clay-500)]" />
                Pending Requests ({pendingConnections.length})
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pendingConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[var(--clay-300)]/30 p-6"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                          {connection.peer_name}
                        </h3>
                        <p className="text-sm text-[var(--charcoal)]/60 italic">{connection.peer_bio}</p>
                      </div>
                      <span className="px-3 py-1 bg-[var(--clay-100)] text-[var(--clay-700)] text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </div>
                    
                    {connection.shared_struggles.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-[var(--charcoal)]/60 mb-2">Shared challenges:</p>
                        <div className="flex flex-wrap gap-1">
                          {connection.shared_struggles.slice(0, 3).map((struggle) => (
                            <span key={struggle} className="px-2 py-1 bg-[var(--sage-50)] text-[var(--sage-700)] text-xs rounded-lg">
                              {formatLabel(struggle)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setSelectedRequest(connection)}
                      className="w-full px-4 py-2 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-xl font-semibold transition-all"
                    >
                      View Request
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Connections */}
          {acceptedConnections.length > 0 ? (
            <div>
              <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-[var(--sage-600)]" />
                Active Connections ({acceptedConnections.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {acceptedConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[var(--clay-300)]/30 p-6 hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => router.push(`/peers/chat/${connection.id}`)}
                  >
                    <div className="mb-4">
                      <h3 className="text-xl font-serif font-bold text-[var(--charcoal)] mb-1" style={{fontFamily: 'var(--font-fraunces)'}}>
                        {connection.peer_name}
                      </h3>
                      <p className="text-sm text-[var(--charcoal)]/60 italic line-clamp-2">{connection.peer_bio}</p>
                    </div>

                    {connection.neurotype.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {connection.neurotype.slice(0, 2).map((type) => (
                            <span key={type} className="px-2 py-1 bg-[var(--clay-50)] text-[var(--clay-700)] text-xs rounded-lg">
                              {formatLabel(type)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {connection.shared_struggles.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs text-[var(--charcoal)]/60 mb-2">We both work on:</p>
                        <div className="flex flex-wrap gap-1">
                          {connection.shared_struggles.slice(0, 2).map((struggle) => (
                            <span key={struggle} className="px-2 py-1 bg-[var(--sage-50)] text-[var(--sage-700)] text-xs rounded-lg">
                              {formatLabel(struggle)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {connection.last_checkin && (
                      <div className="flex items-center gap-2 text-xs text-[var(--charcoal)]/60 mb-3">
                        <Calendar className="w-3 h-3" />
                        Last check-in: {new Date(connection.last_checkin).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/peers/chat/${connection.id}`);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-xl text-sm font-semibold transition-all"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/peers/checkin/${connection.id}`);
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-[var(--cream)] rounded-xl text-sm font-semibold transition-all"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Check-in
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-12 text-center">
              <Users className="w-16 h-16 text-[var(--clay-400)] mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
                No connections yet
              </h3>
              <p className="text-[var(--charcoal)]/70 mb-6">
                Start by finding peers who share your journey
              </p>
              <button
                onClick={() => router.push('/peers')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Find Connections
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Connection Request Modal */}
      {selectedRequest && (
        <ConnectionRequestModal
          peerName={selectedRequest.peer_name}
          peerBio={selectedRequest.peer_bio}
          sharedStruggles={selectedRequest.shared_struggles}
          onAccept={handleAcceptConnection}
          onDecline={handleDeclineConnection}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </AuthenticatedLayout>
  );
}
