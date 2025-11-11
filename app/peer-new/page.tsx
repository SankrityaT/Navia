'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import UniversalNavia from '@/components/ai/UniversalNavia';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface UserPreferences {
  challenges: string[];
  supportType: 'peer' | 'mentor' | 'both';
  topics: string[];
  connectionStyle: string[];
  bio: string;
}

export default function PeerNewPage() {
  const router = useRouter();
  const [step, setStep] = useState<'welcome' | 'onboarding' | 'matching'>('welcome');
  const [messages, setMessages] = useState<Message[]>([]);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial welcome message
  useEffect(() => {
    if (step === 'onboarding' && messages.length === 0) {
      const welcomeMessage: Message = {
        role: 'assistant',
        content: `Hey! I'm so glad you're here. 💛 Looking to connect with peers who get it? I'm here to help you find the right people. First, tell me - what brings you here today? What are you hoping to find support with?`
      };
      setMessages([welcomeMessage]);
    }
  }, [step, messages.length]);

  const handleStartOnboarding = () => {
    setStep('onboarding');
  };

  const handleFindMatches = async () => {
    setIsProcessing(true);
    
    try {
      // Call matching API
      const response = await fetch('/api/peers/match-with-navia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences,
          conversationHistory: messages,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Navigate to matches page with results
        router.push(`/peer-new/matches?sessionId=${data.sessionId}`);
      } else {
        console.error('Failed to find matches');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error finding matches:', error);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-[var(--cream)] pt-32 pb-8">
        <AnimatePresence mode="wait">
          {/* Welcome Screen */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto px-4"
            >
              <div className="text-center mb-12">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="inline-block p-6 bg-gradient-to-br from-[var(--sage-400)] to-[var(--clay-400)] rounded-full mb-6">
                    <span className="text-6xl">🤝</span>
                  </div>
                </motion.div>

                <h1 className="text-5xl font-bold text-[var(--charcoal)] mb-4" style={{ fontFamily: 'var(--font-fraunces)' }}>
                  Find Your People
                </h1>
                
                <p className="text-xl text-[var(--clay-700)] mb-8 max-w-2xl mx-auto">
                  Connect with peers who understand what you're going through. No masking required. 💛
                </p>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-[var(--stone)] shadow-lg max-w-2xl mx-auto mb-8">
                  <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-4">
                    How it works:
                  </h2>
                  <div className="space-y-4 text-left">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[var(--sage-500)] rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)] mb-1">Chat with Navia</h3>
                        <p className="text-[var(--clay-700)]">Tell me what you're looking for and what kind of support would help</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[var(--sage-500)] rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)] mb-1">Get matched</h3>
                        <p className="text-[var(--clay-700)]">I'll find peers facing similar challenges or who can help guide you</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[var(--sage-500)] rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)] mb-1">Connect & chat</h3>
                        <p className="text-[var(--clay-700)]">Send a message to start the conversation (anonymous at first!)</p>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleStartOnboarding}
                  className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-12 py-4 rounded-full text-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                >
                  Let's Get Started 💛
                </button>
              </div>
            </motion.div>
          )}

          {/* Navia Onboarding */}
          {step === 'onboarding' && (
            <motion.div
              key="onboarding"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto px-4"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-[var(--stone)] shadow-lg">
                <UniversalNavia
                  mode="dashboard"
                  context={{
                    mode: 'peer_matching',
                    step: 'onboarding',
                  }}
                  apiEndpoint="/api/peers/onboarding-chat"
                  showAvatar={true}
                  showInput={true}
                  initialMessages={messages}
                  onMessagesChange={setMessages}
                  className="max-w-3xl mx-auto"
                />

                {/* Action buttons */}
                <div className="mt-8 flex justify-center gap-4">
                  <button
                    onClick={() => setStep('welcome')}
                    className="px-6 py-3 bg-white border-2 border-[var(--stone)] text-[var(--charcoal)] rounded-full font-semibold hover:bg-[var(--sand)] transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFindMatches}
                    disabled={messages.length < 4 || isProcessing}
                    className="px-8 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Finding Matches...' : 'Find My Matches 🎯'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
