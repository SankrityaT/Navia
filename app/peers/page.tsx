// FRONTEND: Peer network page
// TODO: Implement swipe/card navigation
// TODO: Add connection management
// TODO: Add group features

'use client';

import { useState, useEffect } from 'react';
import { PeerMatch } from '@/lib/types';
import PeerCard from '@/components/peers/PeerCard';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';

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
    // TODO: Call API to create connection
    console.log('Connect with:', userId);
    nextCard();
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Peer Network</h1>
              <p className="text-gray-600">
                Connect with others navigating similar post-grad challenges
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900">
                {currentIndex + 1} / {matches.length}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex justify-center">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding your matches...</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No matches yet</h3>
              <p className="text-gray-600 mb-6">
                Complete your peer profile to start connecting with others
              </p>
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Create Profile
              </button>
            </div>
          ) : currentIndex >= matches.length ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                You've seen all matches!
              </h3>
              <p className="text-gray-600 mb-6">
                Check back later for new connections
              </p>
              <button
                onClick={() => setCurrentIndex(0)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
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
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Accountability Partners</h3>
            <p className="text-gray-600 text-sm">
              Find someone to check in with weekly on your goals
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Career Networking</h3>
            <p className="text-gray-600 text-sm">
              Connect with peers in your field for advice and opportunities
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Support Groups</h3>
            <p className="text-gray-600 text-sm">
              Join groups focused on specific challenges or goals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
