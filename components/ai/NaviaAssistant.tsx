'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import UniversalNavia from './UniversalNavia';

interface NaviaAssistantProps {
  energyLevel: number;
  focusMode: boolean;
  context: any;
  onBreakdownRequest?: (taskTitle: string) => void;
  manualTrigger?: boolean;
  manualMessage?: string;
  celebrationMode?: boolean; // If true, show message directly without AI response
  apiEndpoint?: string; // Custom API endpoint (default: /api/dashboard-chat)
}

/**
 * NaviaAssistant - Context-aware wrapper for UniversalNavia
 * Automatically triggers when:
 * - Energy level drops to 3 or below
 * - User enters focus mode
 * - User explicitly opens it
 */
export default function NaviaAssistant({ 
  energyLevel, 
  focusMode, 
  context, 
  onBreakdownRequest,
  manualTrigger = false,
  manualMessage = '',
  celebrationMode = false,
  apiEndpoint = '/api/dashboard-chat'
}: NaviaAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [proactiveMessage, setProactiveMessage] = useState<string>('');
  const [celebrationMessage, setCelebrationMessage] = useState<string>('');
  const [hasShownTodayCheckIn, setHasShownTodayCheckIn] = useState(false);
  
  // Check if we've shown check-in today
  useEffect(() => {
    const lastCheckInDate = localStorage.getItem('navia_last_checkin');
    const today = new Date().toDateString();
    
    if (lastCheckInDate !== today) {
      // First login of the day - show check-in
      setTimeout(() => {
        setIsOpen(true);
        setProactiveMessage(
          "Good to see you! 💛 How are you feeling today? I'm here to support you however you need."
        );
        localStorage.setItem('navia_last_checkin', today);
        setHasShownTodayCheckIn(true);
      }, 2000); // Wait 2 seconds after page load
    } else {
      setHasShownTodayCheckIn(true);
    }
  }, []);

  // Manual trigger (for breakdown, etc.)
  useEffect(() => {
    if (manualTrigger) {
      setIsOpen(true);
      if (celebrationMode) {
        // Show celebration message directly (no AI response)
        setCelebrationMessage(manualMessage);
        setProactiveMessage(''); // Don't trigger AI
      } else {
        // Normal mode - trigger AI conversation
        setProactiveMessage(manualMessage || "Hey! I'm here to help. What's on your mind?");
        setCelebrationMessage('');
      }
    }
  }, [manualTrigger, manualMessage, celebrationMode]);

  // Periodic check-ins every 3 hours
  useEffect(() => {
    if (!hasShownTodayCheckIn) return;
    
    const checkInMessages = [
      "Hey! Just checking in. How are you feeling? 💛",
      "Taking a moment to see how you're doing. Need anything?",
      "Hi there! Want to talk about how things are going?",
      "Just wanted to say you're doing great! How can I support you?",
      "Checking in! Is there anything I can help you with right now?"
    ];

    const CHECK_IN_INTERVAL = 3 * 60 * 60 * 1000; // 3 hours
    
    const interval = setInterval(() => {
      const randomMessage = checkInMessages[Math.floor(Math.random() * checkInMessages.length)];
      setIsOpen(true);
      setProactiveMessage(randomMessage);
    }, CHECK_IN_INTERVAL);

    return () => clearInterval(interval);
  }, [hasShownTodayCheckIn]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-[var(--cream)] flex flex-col items-center justify-center p-8"
      >
        {/* Close button - top right - highly visible */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-8 right-8 bg-[var(--charcoal)] hover:bg-[var(--charcoal)]/80 text-white rounded-full p-3 transition-all shadow-lg z-50"
          aria-label="Close Navia"
          title="Close"
        >
          <X className="w-8 h-8" strokeWidth={2.5} />
        </button>

        {/* Content - like OnboardingV2 */}
        <div className="w-full max-w-4xl flex flex-col items-center">
          <UniversalNavia
            mode={focusMode ? 'focus' : 'dashboard'}
            context={context}
            apiEndpoint={apiEndpoint}
            showAvatar={true}
            showInput={true}
            proactiveMessage={proactiveMessage}
            initialMessages={celebrationMessage ? [{ role: 'assistant', content: celebrationMessage }] : []}
            key={isOpen ? 'open' : 'closed'}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
