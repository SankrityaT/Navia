'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import MatchCardStack from '@/components/peers/MatchCardStack';
import ConnectionModal from '@/components/peers/ConnectionModal';
import { MOCK_PEERS, MockPeer, getShuffledPeers } from '@/lib/mock/peers';

export default function MatchesPage() {
  const router = useRouter();
  const [peers, setPeers] = useState<MockPeer[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<MockPeer | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [connections, setConnections] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    // Load shuffled peers
    setPeers(getShuffledPeers());
    
    // Load existing connections from localStorage
    const saved = localStorage.getItem('peer_connections');
    if (saved) {
      setConnections(JSON.parse(saved));
    }
  }, []);

  const handleConnect = (peer: MockPeer) => {
    setSelectedPeer(peer);
    setShowModal(true);
  };

  const handlePass = (peer: MockPeer) => {
    console.log('Passed on:', peer.name);
  };

  const handleSendMessage = (message: string) => {
    if (!selectedPeer) return;

    // Save connection to localStorage
    const newConnections = [...connections, selectedPeer.id];
    setConnections(newConnections);
    localStorage.setItem('peer_connections', JSON.stringify(newConnections));

    // Initialize chat with first message from user and a welcoming response from peer
    const chatKey = `chat_${selectedPeer.id}`;
    const initialMessages = [
      {
        id: '1',
        from: 'user' as const,
        content: message,
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        from: 'peer' as const,
        content: `Hey! Thanks for reaching out. I'm excited to connect! 💛`,
        timestamp: new Date(Date.now() + 1000).toISOString(), // 1 second later
      }
    ];
    localStorage.setItem(chatKey, JSON.stringify(initialMessages));

    setShowModal(false);
    
    // Navigate to chat
    router.push(`/peer-new/chat/${selectedPeer.id}`);
  };

  const handleComplete = () => {
    setIsComplete(true);
  };

  const handleViewConnections = () => {
    router.push('/peer-new/connections');
  };

  const handleStartOver = () => {
    setPeers(getShuffledPeers());
    setIsComplete(false);
  };

  if (peers.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--cream)] pt-32 pb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🔄</div>
            <p className="text-xl text-[var(--charcoal)]">Loading matches...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-[var(--cream)] pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          {!isComplete ? (
            <>
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-4" style={{ fontFamily: 'var(--font-fraunces)' }}>
                  Your Matches
                </h1>
                <p className="text-xl text-[var(--clay-700)]">
                  Found {peers.length} peers who might be a great fit 💛
                </p>
              </motion.div>

              {/* Back Button - Moved above cards */}
              <div className="mb-8 text-center">
                <button
                  onClick={() => router.push('/peer-new')}
                  className="px-6 py-3 bg-white border-2 border-[var(--stone)] text-[var(--charcoal)] rounded-full font-semibold hover:bg-[var(--sand)] transition-all"
                >
                  ← Back to Onboarding
                </button>
              </div>

              {/* Card Stack */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <MatchCardStack
                  peers={peers}
                  onConnect={handleConnect}
                  onPass={handlePass}
                  onComplete={handleComplete}
                />
              </motion.div>
            </>
          ) : (
            /* Completion Screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border-2 border-[var(--stone)] shadow-lg max-w-2xl mx-auto">
                <div className="text-6xl mb-6">🎉</div>
                <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-4" style={{ fontFamily: 'var(--font-fraunces)' }}>
                  You've seen all matches!
                </h2>
                <p className="text-xl text-[var(--clay-700)] mb-8">
                  {connections.length > 0
                    ? `You connected with ${connections.length} peer${connections.length > 1 ? 's' : ''}! Check your connections to start chatting.`
                    : "No connections yet, but you can always come back and try again!"}
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {connections.length > 0 && (
                    <button
                      onClick={handleViewConnections}
                      className="px-8 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full font-semibold text-lg transition-all shadow-md"
                    >
                      View Connections 💛
                    </button>
                  )}
                  <button
                    onClick={handleStartOver}
                    className="px-8 py-4 bg-white border-2 border-[var(--stone)] text-[var(--charcoal)] rounded-full font-semibold text-lg hover:bg-[var(--sand)] transition-all"
                  >
                    See Matches Again
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Connection Modal */}
      {selectedPeer && (
        <ConnectionModal
          peer={selectedPeer}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSend={handleSendMessage}
        />
      )}
    </>
  );
}
