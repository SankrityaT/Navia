'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockPeer } from '@/lib/mock/peers';
import MatchCard from './MatchCard';

interface MatchCardStackProps {
  peers: MockPeer[];
  onConnect: (peer: MockPeer) => void;
  onPass: (peer: MockPeer) => void;
  onComplete: () => void;
}

export default function MatchCardStack({ peers, onConnect, onPass, onComplete }: MatchCardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const currentPeer = peers[currentIndex];
  const nextPeers = peers.slice(currentIndex + 1, currentIndex + 3);

  const handlePass = () => {
    setDirection('left');
    onPass(currentPeer);
    setTimeout(() => {
      if (currentIndex < peers.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setDirection(null);
      } else {
        onComplete();
      }
    }, 300);
  };

  const handleConnect = () => {
    setDirection('right');
    onConnect(currentPeer);
    setTimeout(() => {
      if (currentIndex < peers.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setDirection(null);
      } else {
        onComplete();
      }
    }, 300);
  };

  if (!currentPeer) {
    return null;
  }

  return (
    <div className="relative w-full max-w-md mx-auto" style={{ height: '600px' }}>
      {/* Background cards (stack effect) */}
      {nextPeers.map((peer, index) => (
        <div
          key={peer.id}
          className="absolute inset-0 bg-white rounded-3xl shadow-xl border-2 border-[var(--stone)]"
          style={{
            transform: `scale(${1 - (index + 1) * 0.05}) translateY(${(index + 1) * -10}px)`,
            opacity: 1 - (index + 1) * 0.2,
            zIndex: nextPeers.length - index,
          }}
        />
      ))}

      {/* Current card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPeer.id}
          initial={{ scale: 0.8, opacity: 0, rotateZ: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            rotateZ: 0,
            x: 0,
          }}
          exit={{
            x: direction === 'left' ? -500 : direction === 'right' ? 500 : 0,
            opacity: 0,
            rotateZ: direction === 'left' ? -20 : direction === 'right' ? 20 : 0,
            transition: { duration: 0.3 },
          }}
          className="relative"
          style={{ zIndex: 100 }}
        >
          <MatchCard
            peer={currentPeer}
            onPass={handlePass}
            onConnect={handleConnect}
          />
        </motion.div>
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2">
        {peers.map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all ${
              index < currentIndex
                ? 'w-8 bg-[var(--sage-500)]'
                : index === currentIndex
                ? 'w-12 bg-[var(--clay-500)]'
                : 'w-2 bg-[var(--stone)]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
