// FRONTEND: Unified Connections page - shows both potential matches and existing connections
// Combines functionality of /peers and /connections into tabbed interface

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import ConnectionRequestModal from '@/components/peers/ConnectionRequestModal';
import ConnectionSuccessDialog from '@/components/peers/ConnectionSuccessDialog';
import PeerCard from '@/components/peers/PeerCard';
import { useConnectionsStore } from '@/lib/stores/connectionsStore';
import { usePeersStore } from '@/lib/store/peersStore';
import { generateAnonymousName } from '@/lib/utils/anonymousNames';
import { Users, MessageCircle, Calendar, CheckCircle, Clock, Sparkles, UserPlus } from 'lucide-react';
import type { PeersState } from '@/lib/store/peersStore';

interface Connection {
  id: string;
  peer_id: string;
  peer_name: string | null;
  peer_bio: string;
  neurotype: string[];
  shared_struggles: string[];
  status: 'pending' | 'active' | 'paused' | 'ended';
  created_at: string;
  last_checkin?: string;
  initiated_by?: string;
  peer_revealed?: boolean;
}

export default function ConnectionsPage() {
  const router = useRouter();
  const [selectedRequest, setSelectedRequest] = useState<Connection | null>(null);
  const [acceptedConnectionId, setAcceptedConnectionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'messages' | 'discover'>('messages');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { 
    connections, 
    isLoading: loading, 
    currentUserId,
    showSuccessDialog,
    fetchConnections, 
    acceptConnection, 
    declineConnection,
    setCurrentUserId,
    setShowSuccessDialog
  } = useConnectionsStore();

  const matches = usePeersStore((state: PeersState) => state.matches);
  const hasProfile = usePeersStore((state: PeersState) => state.hasProfile);
  const isLoadingMatches = usePeersStore((state: PeersState) => state.isLoading);
  const matchError = usePeersStore((state: PeersState) => state.error);
  const startPolling = usePeersStore((state: PeersState) => state.startPolling);
  const stopPolling = usePeersStore((state: PeersState) => state.stopPolling);

  useEffect(() => {
    fetchCurrentUser();
    fetchConnections();
    startPolling();
    return () => stopPolling();
  }, [fetchConnections, startPolling, stopPolling]);

  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [matches.length]);

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

  const handleAcceptConnection = async () => {
    if (!selectedRequest) return;
    
    const success = await acceptConnection(selectedRequest.id);
    if (success) {
      setAcceptedConnectionId(selectedRequest.id);
      setSelectedRequest(null);
    } else {
      alert('Failed to accept connection. Please try again.');
    }
  };

  const handleDeclineConnection = async () => {
    if (!selectedRequest) return;
    
    const success = await declineConnection(selectedRequest.id);
    if (success) {
      setSelectedRequest(null);
    } else {
      alert('Failed to decline connection. Please try again.');
    }
  };

  const handleConnect = async (userId: string) => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/peers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTimeout(() => {
          if (currentMatchIndex < matches.length - 1) {
            setCurrentMatchIndex(currentMatchIndex + 1);
          } else {
            setCurrentMatchIndex(matches.length);
          }
          setIsConnecting(false);
        }, 1000);
      } else {
        alert('Failed to send connection request. Please try again.');
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Connect error:', error);
      alert('Something went wrong. Please try again.');
      setIsConnecting(false);
    }
  };

  const handlePass = (userId: string) => {
    if (currentMatchIndex < matches.length - 1) {
      setCurrentMatchIndex(currentMatchIndex + 1);
    } else {
      setCurrentMatchIndex(matches.length);
    }
  };

  const formatLabel = (key: string) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const acceptedConnections = connections.filter(c => c.status === 'active');
  // Only show pending requests that were sent TO me (not ones I sent)
  // AND exclude anyone I'm already connected with
  const acceptedPeerIds = new Set(acceptedConnections.map(c => c.peer_id));
  const pendingConnections = connections.filter(c => 
    c.status === 'pending' && 
    c.initiated_by !== currentUserId &&
    !acceptedPeerIds.has(c.peer_id) // Don't show pending if already connected
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
          {/* Header with Tabs */}
          <div className="mb-6">
            <h1 className="text-3xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
              Connections
            </h1>
            
            {/* Tabs */}
            <div className="flex gap-2 bg-[var(--sand)]/80 backdrop-blur-sm rounded-2xl p-2 border border-[var(--clay-300)]/30 w-fit">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'messages'
                    ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-md'
                    : 'text-[var(--charcoal)]/60 hover:text-[var(--charcoal)] hover:bg-[var(--stone)]'
                }`}
              >
                <MessageCircle className="w-4 h-4" />
                Messages
                {(acceptedConnections.length + pendingConnections.length) > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'messages' ? 'bg-[var(--cream)] text-[var(--clay-500)]' : 'bg-[var(--clay-200)] text-[var(--clay-700)]'
                  }`}>
                    {acceptedConnections.length + pendingConnections.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
                  activeTab === 'discover'
                    ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-md'
                    : 'text-[var(--charcoal)]/60 hover:text-[var(--charcoal)] hover:bg-[var(--stone)]'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Discover
                {matches.length > 0 && currentMatchIndex < matches.length && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    activeTab === 'discover' ? 'bg-[var(--cream)] text-[var(--clay-500)]' : 'bg-[var(--sage-200)] text-[var(--sage-700)]'
                  }`}>
                    {matches.length - currentMatchIndex}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Messages Tab Content */}
          {activeTab === 'messages' && (
            <>
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
                          {connection.peer_name || generateAnonymousName(connection.peer_id)}
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

          {/* Active Connections - Modern DM Style */}
          {acceptedConnections.length > 0 ? (
            <div>
              <h2 className="text-xl font-semibold text-[var(--charcoal)] mb-4 px-2">
                Messages
              </h2>
              <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-2xl shadow-lg border border-[var(--clay-300)]/30 overflow-hidden">
                {acceptedConnections.map((connection, index) => (
                  <div
                    key={connection.id}
                    onClick={() => router.push(`/peers/chat/${connection.id}`)}
                    className={`flex items-center gap-4 p-4 hover:bg-[var(--stone)]/50 cursor-pointer transition-all ${
                      index !== acceptedConnections.length - 1 ? 'border-b border-[var(--clay-300)]/20' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center text-[var(--cream)] font-bold text-lg flex-shrink-0 shadow-md">
                      {(connection.peer_name || generateAnonymousName(connection.peer_id)).charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between mb-1">
                        <h3 className="text-lg font-semibold text-[var(--charcoal)] truncate">
                          {connection.peer_name || generateAnonymousName(connection.peer_id)}
                        </h3>
                        <span className="text-xs text-[var(--charcoal)]/50 ml-2 flex-shrink-0">
                          {new Date(connection.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-[var(--charcoal)]/60 truncate">
                        {connection.shared_struggles.length > 0 
                          ? `Working on: ${connection.shared_struggles.slice(0, 2).map(s => formatLabel(s)).join(', ')}`
                          : connection.peer_bio
                        }
                      </p>
                      
                      {connection.neurotype.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {connection.neurotype.slice(0, 2).map((type) => (
                            <span key={type} className="px-2 py-0.5 bg-[var(--sage-100)] text-[var(--sage-700)] text-xs rounded-full">
                              {formatLabel(type)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Chevron */}
                    <MessageCircle className="w-5 h-5 text-[var(--charcoal)]/30 flex-shrink-0" />
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
                onClick={() => setActiveTab('discover')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all shadow-lg"
              >
                <Sparkles className="w-5 h-5" />
                Discover Connections
              </button>
            </div>
          )}
            </>
          )}

          {/* Discover Tab Content */}
          {activeTab === 'discover' && (
            <div className="flex justify-center">
              {isLoadingMatches ? (
                <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--clay-500)] mx-auto mb-4"></div>
                  <p className="text-[var(--charcoal)]/70">Finding potential connections...</p>
                </div>
              ) : matchError ? (
                <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-red-300/40 p-12 text-center max-w-md">
                  <Users className="w-16 h-16 text-red-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>Unable to load matches</h3>
                  <p className="text-[var(--charcoal)]/70 mb-4">{matchError}</p>
                  <button
                    onClick={() => usePeersStore.getState().fetchMatches()}
                    className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all shadow-lg"
                  >
                    Try Again
                  </button>
                </div>
              ) : !hasProfile ? (
                <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-12 text-center max-w-md">
                  <Users className="w-16 h-16 text-[var(--clay-400)] mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>No profile found</h3>
                  <p className="text-[var(--charcoal)]/70 mb-6">
                    Your profile needs to be updated. Please edit your profile or re-complete onboarding.
                  </p>
                  <button 
                    onClick={() => router.push('/profile/edit')}
                    className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all shadow-lg"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : currentMatchIndex >= matches.length ? (
                <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-12 text-center max-w-md">
                  <CheckCircle className="w-16 h-16 text-[var(--sage-600)] mx-auto mb-4" />
                  <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>You're all caught up!</h3>
                  <p className="text-[var(--charcoal)]/70 mb-6">
                    No more potential connections right now. Check back later for new matches.
                  </p>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all shadow-lg"
                  >
                    View Messages
                  </button>
                </div>
              ) : (
                <div className="w-full max-w-md">
                  <PeerCard
                    peer={matches[currentMatchIndex].peer}
                    matchScore={matches[currentMatchIndex].score}
                    matchReasons={matches[currentMatchIndex].matchReasons}
                    onConnect={handleConnect}
                    onPass={handlePass}
                    isConnecting={isConnecting}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Connection Request Modal */}
      {selectedRequest && (
        <ConnectionRequestModal
          peerName={selectedRequest.peer_name || generateAnonymousName(selectedRequest.peer_id)}
          peerBio={selectedRequest.peer_bio}
          sharedStruggles={selectedRequest.shared_struggles}
          onAccept={handleAcceptConnection}
          onDecline={handleDeclineConnection}
          onClose={() => setSelectedRequest(null)}
        />
      )}

      {/* Success Dialog */}
      <ConnectionSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        peerName={acceptedConnectionId ? (connections.find(c => c.id === acceptedConnectionId)?.peer_name || generateAnonymousName(connections.find(c => c.id === acceptedConnectionId)?.peer_id || '')) : ''}
        connectionId={acceptedConnectionId || undefined}
      />
    </AuthenticatedLayout>
  );
}
