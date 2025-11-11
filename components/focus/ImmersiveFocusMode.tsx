'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X, Minimize2 } from 'lucide-react';
import UniversalNavia from '../ai/UniversalNavia';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ImmersiveFocusModeProps {
  taskTitle: string;
  initialTime: number; // in seconds
  onEnd: () => void;
  onMinimize: () => void;
  context?: any;
}

export default function ImmersiveFocusMode({
  taskTitle,
  initialTime,
  onEnd,
  onMinimize,
  context = {},
}: ImmersiveFocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(false);
  const [naviaAsleep, setNaviaAsleep] = useState(true);
  const [proactiveMessage, setProactiveMessage] = useState('');
  const [focusMessages, setFocusMessages] = useState<Message[]>([]);
  const checkInIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSessionComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, timeLeft]);

  // Initial check-in about the task
  useEffect(() => {
    // Wait 3 seconds then check in about the task
    const initialTimeout = setTimeout(() => {
      setProactiveMessage(`How's ${taskTitle} going? Need help breaking it down?`);
      setNaviaAsleep(false);
    }, 3000);

    return () => clearTimeout(initialTimeout);
  }, []); // Only run once on mount

  // Proactive check-ins based on focus time
  useEffect(() => {
    // Calculate check-in frequency based on total time
    // For 25 min (1500s): check in every 8-10 minutes
    // For 50 min (3000s): check in every 15 minutes
    const checkInFrequency = Math.max(480, Math.floor(initialTime / 3)); // seconds

    const scheduleCheckIn = () => {
      checkInIntervalRef.current = setTimeout(() => {
        if (!isPaused && timeLeft > 0) {
          const messages = [
            `How's ${taskTitle} going? 💛`,
            "You're doing great! Need anything?",
            "Still with you! How's the focus?",
            "Taking a breath? I'm here if you need me",
            "You've got this! How are you feeling?",
          ];
          
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setProactiveMessage(randomMessage);
          setNaviaAsleep(false);
          
          // Reset after showing message
          setTimeout(() => {
            setProactiveMessage('');
            setNaviaAsleep(true);
          }, 5000);
          
          scheduleCheckIn(); // Schedule next check-in
        }
      }, checkInFrequency * 1000);
    };

    scheduleCheckIn();

    return () => {
      if (checkInIntervalRef.current) {
        clearTimeout(checkInIntervalRef.current);
      }
    };
  }, [initialTime, isPaused, timeLeft, taskTitle]);

  const handleSessionComplete = () => {
    setProactiveMessage("Amazing work! You stayed focused the whole time! 🎉 How do you feel?");
    setNaviaAsleep(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWakeNavia = () => {
    setNaviaAsleep(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50"
    >
      {/* Blurred background with gradient */}
      <div 
        className="absolute inset-0 backdrop-blur-2xl"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(196, 165, 123, 0.1) 0%,
              rgba(232, 220, 200, 0.15) 25%,
              rgba(156, 169, 134, 0.1) 50%,
              rgba(107, 142, 111, 0.15) 75%,
              rgba(196, 165, 123, 0.1) 100%
            )
          `
        }}
      />

      {/* Content */}
      <div className="relative h-full flex flex-col p-8">
        {/* Minimize button */}
        <button
          onClick={onMinimize}
          className="absolute top-8 right-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-full p-3 transition-all z-10"
        >
          <Minimize2 className="w-6 h-6" />
        </button>

        {/* Fixed Top Section - Title & Timer */}
        <div className="flex-shrink-0 max-w-4xl w-full mx-auto space-y-8 mb-8">
          {/* Task title */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-2">
              Focusing on:
            </h2>
            <p className="text-5xl font-bold text-[var(--clay-600)]">
              {taskTitle}
            </p>
          </motion.div>

          {/* Timer */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <div className="text-9xl font-bold text-[var(--charcoal)] mb-8 tracking-tight">
              {formatTime(timeLeft)}
            </div>

            {/* Controls */}
            <div className="flex gap-6 justify-center">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full px-12 py-6 text-2xl font-semibold transition-all shadow-2xl flex items-center gap-4"
              >
                {isPaused ? (
                  <>
                    <Play className="w-8 h-8" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-8 h-8" />
                    Pause
                  </>
                )}
              </button>

              <button
                onClick={onEnd}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-[var(--charcoal)] border-2 border-[var(--stone)] rounded-full px-12 py-6 text-2xl font-semibold transition-all flex items-center gap-4"
              >
                <X className="w-8 h-8" />
                End Session
              </button>
            </div>
          </motion.div>
        </div>

        {/* Scrollable Bottom Section - Navia Chat */}
        <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[var(--stone)] mb-8"
          >
            <UniversalNavia
              mode="focus"
              context={context}
              apiEndpoint="/api/dashboard-chat"
              showAvatar={true}
              showInput={!naviaAsleep}
              isAsleep={naviaAsleep}
              onWake={handleWakeNavia}
              proactiveMessage={proactiveMessage}
              initialMessages={focusMessages}
              onMessagesChange={setFocusMessages}
              className="max-w-2xl mx-auto"
            />
          </motion.div>

          {/* Encouragement */}
          {!naviaAsleep && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-2xl text-[var(--sage-700)] font-medium mb-8"
            >
              I'm right here with you 💛
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
