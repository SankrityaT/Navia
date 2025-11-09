// FRONTEND: Individual peer connection page (MVP)
// Shows chat + accountability dashboard for active connection

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MessageCircle, Target } from 'lucide-react';
import PeerChatInterface from '@/components/peers/PeerChatInterface';
import AccountabilityDashboard from '@/components/peers/AccountabilityDashboard';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { PeerConnection } from '@/lib/types';

export default function ConnectionPage() {
  const params = useParams();
  const connectionId = params.id as string;
  
  const [connection, setConnection] = useState<PeerConnection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'accountability'>('chat');
  
  // TODO: Get from auth
  const currentUserId = 'user_current';
  const peerName = 'Sarah'; // TODO: Fetch from connection

  useEffect(() => {
    fetchConnection();
  }, [connectionId]);

  const fetchConnection = async () => {
    try {
      // TODO: Create API endpoint to fetch single connection
      // For now, mock data
      const mockConnection: PeerConnection = {
        connection_id: connectionId,
        user1_id: currentUserId,
        user2_id: 'user_peer',
        status: 'active',
        initiated_by: currentUserId,
        created_at: new Date().toISOString(),
        accepted_at: new Date().toISOString(),
        goals: {
          user1_goals: [
            'Apply to 5 jobs',
            'Update LinkedIn profile',
            'Practice interview questions',
          ],
          user2_goals: [
            'Complete budget spreadsheet',
            'Research health insurance options',
            'Set up automatic savings',
          ],
        },
      };
      setConnection(mockConnection);
    } catch (error) {
      console.error('Failed to fetch connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--clay-500)]"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (!connection) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)] mb-4" style={{fontFamily: 'var(--font-fraunces)'}}>
              Connection Not Found
            </h2>
            <p className="text-[var(--charcoal)]/60">Use the navbar to navigate back to Connections</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[var(--cream)] relative overflow-hidden">
        {/* Organic background */}
        <div className="absolute inset-0 texture-grain"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--clay-200)] rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-[var(--charcoal)] mb-2" style={{fontFamily: 'var(--font-fraunces)'}}>
                {peerName}
              </h1>
              <p className="text-[var(--charcoal)]/70">
                Accountability Partnership
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'chat'
                ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-lg'
                : 'bg-[var(--sand)]/80 text-[var(--charcoal)] hover:bg-[var(--stone)]'
            }`}
          >
            <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('accountability')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
              activeTab === 'accountability'
                ? 'bg-[var(--clay-500)] text-[var(--cream)] shadow-lg'
                : 'bg-[var(--sand)]/80 text-[var(--charcoal)] hover:bg-[var(--stone)]'
            }`}
          >
            <Target className="w-5 h-5" strokeWidth={2.5} />
            Goals & Check-In
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {activeTab === 'chat' ? (
            <PeerChatInterface
              connection={connection}
              currentUserId={currentUserId}
              peerName={peerName}
            />
          ) : (
            <AccountabilityDashboard
              connection={connection}
              currentUserId={currentUserId}
              peerName={peerName}
            />
          )}
        </div>
      </div>
    </div>
    </AuthenticatedLayout>
  );
}
