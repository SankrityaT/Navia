'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import ChatInterface from '@/components/peers/ChatInterface';
import { getPeerById, MockPeer } from '@/lib/mock/peers';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const peerId = params.peerId as string;
  const [peer, setPeer] = useState<MockPeer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get peer data
    const peerData = getPeerById(peerId);
    
    if (!peerData) {
      // Peer not found, redirect to matches
      router.push('/peer-new/matches');
      return;
    }

    setPeer(peerData);
    setIsLoading(false);
  }, [peerId, router]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--cream)] pt-32 pb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-xl text-[var(--charcoal)]">Loading chat...</p>
          </div>
        </div>
      </>
    );
  }

  if (!peer) {
    return null;
  }

  return (
    <>
      <Navbar />
      
      <div className="h-screen bg-[var(--cream)] pt-24 pb-0">
        <div className="max-w-5xl mx-auto h-full flex flex-col">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-4"
          >
            <button
              onClick={() => router.push('/peer-new/connections')}
              className="px-4 py-2 bg-white border-2 border-[var(--stone)] text-[var(--charcoal)] rounded-full font-semibold hover:bg-[var(--sand)] transition-all"
            >
              ← Back to Connections
            </button>
          </motion.div>

          {/* Chat Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex-1 bg-white rounded-t-3xl border-2 border-[var(--stone)] shadow-2xl overflow-hidden mx-4 mb-0"
          >
            <ChatInterface peer={peer} peerId={peerId} />
          </motion.div>
        </div>
      </div>
    </>
  );
}
