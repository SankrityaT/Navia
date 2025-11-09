// FRONTEND: Peer connections page (MVP)
// Shows match cards with working connect button

'use client';

import { useState, useEffect } from 'react';
import { PeerMatch } from '@/lib/types';
import PeerCard from '@/components/peers/PeerCard';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Users, Sparkles } from 'lucide-react';

export default function PeersPage() {
  const [matches, setMatches] = useState<PeerMatch[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/peers');
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      const response = await fetch('/api/peers/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Connection request sent! They\'ll be notified to accept and set mutual goals.');
        nextCard();
      } else {
        alert('Failed to send connection request. Please try again.');
      }
    } catch (error) {
      console.error('Connect error:', error);
      alert('Something went wrong. Please try again.');
    }
  };

  const handlePass = (userId: string) => {
    console.log('Pass on:', userId);
    nextCard();
  };

  const nextCard = () => {
    if (currentIndex < matches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const currentMatch = matches[currentIndex];

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
        {/* Organic background */}
        <div className="absolute inset-0 texture-grain"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[var(--sage-400)] rounded-full blur-[100px] opacity-15 translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
          
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--sand)]/80 backdrop-blur-sm rounded-full border border-[var(--clay-300)]/30 mb-4">
                <Sparkles className="w-4 h-4 text-[var(--sage-600)]" strokeWidth={2.5} />
                <span className="text-sm text-[var(--charcoal)] font-medium">Find Your People</span>
              </div>
              <h1 className="text-5xl font-serif font-bold text-[var(--charcoal)] mb-3" style={{fontFamily: 'var(--font-fraunces)'}}>Connections</h1>
              <p className="text-[var(--charcoal)]/70 text-lg">
                Meet others navigating similar post-grad challenges—no masking required
              </p>
            </div>
            <div className="flex items-center gap-2 px-5 py-3 bg-[var(--sand)]/80 backdrop-blur-sm rounded-2xl border border-[var(--clay-300)]/30 shadow-sm">
              <Users className="w-5 h-5 text-[var(--clay-600)]" strokeWidth={2.5} />
              <span className="font-semibold text-[var(--charcoal)]">
                {currentIndex + 1} / {matches.length}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center">
          {isLoading ? (
            <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--clay-500)] mx-auto mb-4"></div>
              <p className="text-[var(--charcoal)]/70">Finding your matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-12 text-center max-w-md">
              <Users className="w-16 h-16 text-[var(--clay-400)] mx-auto mb-4" />
              <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>No matches yet</h3>
              <p className="text-[var(--charcoal)]/70 mb-6">
                Complete your peer profile to start connecting with others
              </p>
              <button 
                onClick={() => window.location.href = '/onboarding'}
                className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 shadow-lg"
              >
                Create Profile
              </button>
            </div>
          ) : currentIndex >= matches.length ? (
            <div className="bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30 p-12 text-center max-w-md">
              <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
                You've seen all matches!
              </h3>
              <p className="text-[var(--charcoal)]/70 mb-6">
                Check back later for new connections
              </p>
              <button
                onClick={() => setCurrentIndex(0)}
                className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 shadow-lg"
              >
                Review Matches
              </button>
            </div>
          ) : (
            <PeerCard
              peer={currentMatch.peer}
              matchScore={Math.round(currentMatch.score)}
              matchReasons={currentMatch.matchReasons}
              onConnect={handleConnect}
              onPass={handlePass}
            />
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-[var(--sand)]/60 backdrop-blur-sm rounded-2xl p-6 border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-300">
            <h3 className="text-lg font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>Mutual Accountability</h3>
            <p className="text-[var(--charcoal)]/70 text-sm">
              Find someone to check in with on your goals—you help each other
            </p>
          </div>
          <div className="bg-[var(--sand)]/60 backdrop-blur-sm rounded-2xl p-6 border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-300">
            <h3 className="text-lg font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>Near-Peer Support</h3>
            <p className="text-[var(--charcoal)]/70 text-sm">
              Connect with people 1-3 years ahead who recently navigated your challenges
            </p>
          </div>
          <div className="bg-[var(--sand)]/60 backdrop-blur-sm rounded-2xl p-6 border border-[var(--clay-300)]/20 hover:border-[var(--clay-400)]/40 transition-all duration-300">
            <h3 className="text-lg font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>Safe Space</h3>
            <p className="text-[var(--charcoal)]/70 text-sm">
              No masking required—connect with others who truly understand
            </p>
          </div>
        </div>
      </div>
    </div>
    </AuthenticatedLayout>
  );
}
