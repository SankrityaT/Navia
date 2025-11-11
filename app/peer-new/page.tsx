'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import UniversalNavia from '@/components/ai/UniversalNavia';
import NaviaAvatar from '@/components/ai/NaviaAvatar';

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
    
    // Simulate processing delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Navigate to matches page (using mock data)
    router.push('/peer-new/matches');
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
                {/* Navia's Breathing Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <NaviaAvatar size="xl" isSpeaking={false} />
                </motion.div>

                {/* Navia's Direct Message */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-8"
                >
                  <h1 className="text-5xl font-bold text-[var(--charcoal)] mb-4" style={{ fontFamily: 'var(--font-fraunces)' }}>
                    I'll Help You Find Your People
                  </h1>
                  
                  <p className="text-xl text-[var(--clay-700)] mb-4 max-w-2xl mx-auto">
                    Hey there 💛 I'm Navia, and I'm here to connect you with peers who truly get what you're going through.
                  </p>
                  
                  <p className="text-lg text-[var(--clay-600)] max-w-2xl mx-auto">
                    No masking. No judgment. Just real connections with people who understand.
                  </p>
                </motion.div>

                {/* How I'll Help You */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-[var(--stone)] shadow-lg max-w-2xl mx-auto mb-8"
                >
                  <h2 className="text-2xl font-bold text-[var(--charcoal)] mb-6">
                    Here's how I'll help:
                  </h2>
                  <div className="space-y-6 text-left">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)] mb-1 text-lg">I'll listen to what you need</h3>
                        <p className="text-[var(--clay-700)]">Share what you're struggling with and what kind of support would help you most</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)] mb-1 text-lg">I'll find your matches</h3>
                        <p className="text-[var(--clay-700)]">Using what you tell me, I'll match you with peers facing similar challenges or who can guide you</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--charcoal)] mb-1 text-lg">I'll help you connect</h3>
                        <p className="text-[var(--clay-700)]">Start conversations safely and anonymously - reveal your identity only when you're ready</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  onClick={handleStartOnboarding}
                  className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-12 py-4 rounded-full text-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Let's Get Started 💛
                </motion.button>
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
                    disabled={messages.length < 2 || isProcessing}
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
