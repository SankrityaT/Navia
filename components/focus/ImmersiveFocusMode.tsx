'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X, Minimize2 } from 'lucide-react';
import UniversalNavia from '../ai/UniversalNavia';
import NaviaAvatar from '../ai/NaviaAvatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ImmersiveFocusModeProps {
  taskTitle: string;
  initialTime: number; // in seconds
  initialPaused?: boolean; // Start paused if minimized while paused
  onEnd: () => void;
  onMinimize: (isPaused: boolean, currentTime: number) => void;
  context?: any;
}

export default function ImmersiveFocusMode({
  taskTitle,
  initialTime,
  initialPaused = false,
  onEnd,
  onMinimize,
  context = {},
}: ImmersiveFocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isPaused, setIsPaused] = useState(initialPaused);
  const [naviaAsleep, setNaviaAsleep] = useState(true); // Always start with Navia asleep
  const [focusMessages, setFocusMessages] = useState<Message[]>([]);
  const [showNaviaSection, setShowNaviaSection] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

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

  // NO AUTO-TRIGGERING - Navia only appears when user explicitly requests

  const handleSessionComplete = () => {
    // Show completion modal with options to extend or end
    setIsPaused(true); // Pause the timer
    setShowCompletionModal(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleWakeNavia = () => {
    setNaviaAsleep(false);
    setShowNaviaSection(true);
    
    // Add Navia's greeting directly as an assistant message
    const naviaGreeting: Message = {
      role: 'assistant',
      content: `Hey! How's "${taskTitle}" going? 💛 I'm here if you need help breaking it down, talking through what's blocking you, or just being here with you. What would be most helpful right now?`
    };
    
    setFocusMessages([naviaGreeting]);
  };

  const handleMinimize = () => {
    onMinimize(isPaused, timeLeft);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleExtendTime = (minutes: number) => {
    setTimeLeft(prev => prev + (minutes * 60));
    setShowCompletionModal(false);
    setIsPaused(false); // Resume timer
  };

  const handleEndWithCelebration = () => {
    setShowCompletionModal(false);
    setNaviaAsleep(false);
    setShowNaviaSection(true);
    
    // Navia celebrates the user's focus session
    const celebrationMessage: Message = {
      role: 'assistant',
      content: `Amazing work! 🎉 You just stayed focused on "${taskTitle}" for your entire session. That takes real effort, and I'm so proud of you! 💛 How are you feeling? Want to talk about what you accomplished, or are you ready to take a well-deserved break?`
    };
    
    setFocusMessages([celebrationMessage]);
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
        {/* Top right controls */}
        <div className="absolute top-8 right-8 flex gap-3 z-10">
          {/* Minimize button */}
          <button
            onClick={handleMinimize}
            className="bg-[var(--charcoal)] hover:bg-[var(--charcoal)]/80 text-white rounded-full p-3 transition-all shadow-lg"
            title="Minimize focus mode"
          >
            <Minimize2 className="w-6 h-6" />
          </button>
        </div>

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
            <div className="flex gap-4 justify-center items-center">
              <button
                onClick={togglePause}
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
            
            {/* Pause indicator */}
            {isPaused && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-4"
              >
                <p className="text-xl text-[var(--clay-600)] font-semibold">⏸️ Paused</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Optional Navia Section - Only shown when user requests */}
        {showNaviaSection ? (
          <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-[var(--stone)] mb-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[var(--charcoal)]">Chat with Navia</h3>
                <button
                  onClick={() => {
                    setShowNaviaSection(false);
                    setNaviaAsleep(true);
                  }}
                  className="text-[var(--charcoal)] hover:text-[var(--clay-600)] transition-colors"
                  title="Hide Navia"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <UniversalNavia
                mode="focus"
                context={context}
                apiEndpoint="/api/dashboard-chat"
                showAvatar={true}
                showInput={!naviaAsleep}
                isAsleep={naviaAsleep}
                onWake={handleWakeNavia}
                proactiveMessage=""
                initialMessages={focusMessages}
                onMessagesChange={setFocusMessages}
                className="max-w-2xl mx-auto"
              />
            </motion.div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center w-full mx-auto py-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col items-center gap-8"
            >
              {/* Pulsating Navia Avatar - EXTRA LARGE */}
              <motion.button
                onClick={handleWakeNavia}
                className="relative group cursor-pointer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {/* Outer pulsating ring - larger blur */}
                <motion.div
                  className="absolute -inset-8 rounded-full bg-gradient-to-br from-[var(--sage-400)] to-[var(--clay-400)] opacity-30 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                
                {/* Avatar with hover glow - XL SIZE */}
                <div className="relative">
                  <NaviaAvatar size="xl" />
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--sage-300)] to-[var(--clay-300)] opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-300"
                  />
                </div>
              </motion.button>

              {/* Navia's name with pulsating effect - LARGER */}
              <motion.div
                className="text-center"
                animate={{
                  opacity: [0.85, 1, 0.85],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <h3 className="text-6xl font-bold text-[var(--charcoal)] mb-4">
                  Navia
                </h3>
                <motion.p
                  className="text-2xl text-[var(--clay-700)] font-medium max-w-md"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  I'm here if you need me 💛
                </motion.p>
              </motion.div>

              {/* Subtle call-to-action */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-center"
              >
                <p className="text-base text-[var(--sage-600)] italic">
                  Click to chat with me
                </p>
              </motion.div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Timer Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-white to-[var(--sand)] rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl border-2 border-[var(--clay-200)]"
            >
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="text-6xl mb-4"
                >
                  ⏰
                </motion.div>
                <h2 className="text-3xl font-bold text-[var(--charcoal)] mb-2">
                  Time's Up!
                </h2>
                <p className="text-lg text-[var(--clay-700)]">
                  Great focus session! What would you like to do?
                </p>
              </div>

              <div className="space-y-3">
                {/* Extend options */}
                <div className="bg-white/50 rounded-2xl p-4 border border-[var(--stone)]">
                  <p className="text-sm font-semibold text-[var(--charcoal)] mb-3">
                    Keep going? Add more time:
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map(minutes => (
                      <button
                        key={minutes}
                        onClick={() => handleExtendTime(minutes)}
                        className="bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white rounded-lg px-4 py-3 font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        +{minutes}m
                      </button>
                    ))}
                  </div>
                </div>

                {/* End session button */}
                <button
                  onClick={handleEndWithCelebration}
                  className="w-full bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-2xl px-6 py-4 text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <span>🎉</span>
                  End Session & Celebrate
                </button>

                {/* Continue without ending */}
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    setIsPaused(false);
                  }}
                  className="w-full bg-white/50 hover:bg-white/70 text-[var(--charcoal)] border-2 border-[var(--stone)] rounded-2xl px-6 py-3 font-medium transition-all"
                >
                  Keep Timer at 0:00
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
