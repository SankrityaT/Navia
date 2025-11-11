'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import { getPeerById, MockPeer } from '@/lib/mock/peers';

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<MockPeer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load connections from localStorage
    const saved = localStorage.getItem('peer_connections');
    
    if (saved) {
      const connectionIds: string[] = JSON.parse(saved);
      const peers = connectionIds
        .map(id => getPeerById(id))
        .filter((peer): peer is MockPeer => peer !== undefined);
      
      setConnections(peers);
    }
    
    setIsLoading(false);
  }, []);

  const getLastMessage = (peerId: string) => {
    const chatKey = `chat_${peerId}`;
    const saved = localStorage.getItem(chatKey);
    
    if (saved) {
      const messages = JSON.parse(saved);
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        return {
          content: lastMessage.content,
          timestamp: lastMessage.timestamp,
        };
      }
    }
    
    return null;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--cream)] pt-32 pb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-xl text-[var(--charcoal)]">Loading connections...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-[var(--cream)] pt-32 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-[var(--charcoal)]" style={{ fontFamily: 'var(--font-fraunces)' }}>
                Your Connections
              </h1>
              <button
                onClick={() => router.push('/peer-new/matches')}
                className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full font-semibold transition-all shadow-md"
              >
                Find More Peers
              </button>
            </div>
            <p className="text-xl text-[var(--clay-700)]">
              {connections.length > 0
                ? `You have ${connections.length} active connection${connections.length > 1 ? 's' : ''} 💛`
                : 'No connections yet. Start matching to find your people!'}
            </p>
          </motion.div>

          {/* Connections List */}
          {connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((peer, index) => {
                const lastMessage = getLastMessage(peer.id);
                
                return (
                  <motion.div
                    key={peer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <button
                      onClick={() => router.push(`/peer-new/chat/${peer.id}`)}
                      className="w-full bg-white hover:bg-[var(--sand)] border-2 border-[var(--stone)] rounded-3xl p-6 transition-all shadow-md hover:shadow-lg text-left"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="text-5xl flex-shrink-0">
                          {peer.avatar}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xl font-bold text-[var(--charcoal)]" style={{ fontFamily: 'var(--font-fraunces)' }}>
                              {peer.name}
                            </h3>
                            <span className="text-sm text-[var(--clay-600)] flex-shrink-0 ml-2">
                              {lastMessage && formatTimestamp(lastMessage.timestamp)}
                            </span>
                          </div>

                          {/* Match Score */}
                          <div className="mb-2">
                            <span className="px-3 py-1 bg-[var(--sage-100)] text-[var(--sage-700)] rounded-full text-sm font-medium">
                              {peer.matchScore}% Match
                            </span>
                          </div>

                          {/* Last Message */}
                          {lastMessage && (
                            <p className="text-[var(--clay-700)] truncate">
                              {lastMessage.content}
                            </p>
                          )}

                          {/* Challenges */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {peer.challenges.slice(0, 3).map((challenge, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-[var(--clay-100)] text-[var(--clay-700)] rounded-full text-xs font-medium"
                              >
                                {challenge}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="text-2xl text-[var(--clay-500)] flex-shrink-0">
                          →
                        </div>
                      </div>
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border-2 border-[var(--stone)] shadow-lg">
                <div className="text-6xl mb-6">🤝</div>
                <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-4" style={{ fontFamily: 'var(--font-fraunces)' }}>
                  No connections yet
                </h2>
                <p className="text-lg text-[var(--clay-700)] mb-8">
                  Start matching with peers to build your support network!
                </p>
                <button
                  onClick={() => router.push('/peer-new/matches')}
                  className="px-8 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full font-semibold text-lg transition-all shadow-md"
                >
                  Find Peers 💛
                </button>
              </div>
            </motion.div>
          )}

          {/* Back Button */}
          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/peer-new')}
              className="px-6 py-3 bg-white border-2 border-[var(--stone)] text-[var(--charcoal)] rounded-full font-semibold hover:bg-[var(--sand)] transition-all"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
