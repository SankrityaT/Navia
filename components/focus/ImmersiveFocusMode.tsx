'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pause, Play, X, Minimize2, Plus } from 'lucide-react';
import UniversalNavia from '../ai/UniversalNavia';
import NaviaAvatar from '../ai/NaviaAvatar';
import FocusMusicPlayer from './FocusMusicPlayer';

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
  initialPaused = false, // Start paused by default so user can choose when to begin
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
  const [isCelebrating, setIsCelebrating] = useState(false);

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
    setIsCelebrating(true);
    
    // Navia celebrates the user's focus session
    const celebrationMessage: Message = {
      role: 'assistant',
      content: `🎉 Wow, you did it! You just completed a full focus session on "${taskTitle}"! \n\nI know staying focused isn't always easy, especially when your mind wants to wander or when things feel overwhelming. But you showed up, you stayed present, and you gave it your all. That's something to be really proud of. 💛\n\nTake a moment to appreciate what you just accomplished. You deserve this win! \n\nHow are you feeling? Want to share what you got done, or are you ready for a well-deserved break?`
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
      <div className="relative h-full overflow-y-auto">
        {/* Top right controls */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-3 z-10">
          {/* Minimize button */}
          <button
            onClick={handleMinimize}
            className="bg-[var(--charcoal)] hover:bg-[var(--charcoal)]/80 text-white rounded-full p-2 md:p-3 transition-all shadow-lg"
            title="Minimize focus mode"
          >
            <Minimize2 className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Content Container with padding */}
        <div className="min-h-full flex items-center justify-center p-4 md:p-8 pt-16 md:pt-20 pb-8 md:pb-12">
          {/* Two Column Layout: Timer on Right, Navia on Left */}
          <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            
            {/* Left Side: Navia Section */}
            <div className="flex flex-col items-center justify-center order-2 md:order-1 space-y-8">

              {showNaviaSection ? (
                <div className="w-full">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-white/80 backdrop-blur-md rounded-3xl p-4 md:p-8 shadow-2xl border border-[var(--stone)] mb-8 overflow-hidden"
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
                showInput={!naviaAsleep && !isCelebrating}
                isAsleep={naviaAsleep}
                onWake={handleWakeNavia}
                proactiveMessage=""
                initialMessages={focusMessages}
                onMessagesChange={setFocusMessages}
                className="max-w-2xl mx-auto"
              />
              
              {/* End Session Button - Show after celebration */}
              {isCelebrating && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center"
                >
                  <button
                    onClick={onEnd}
                    className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto"
                  >
                    <span>✨</span>
                    End Session
                  </button>
                </motion.div>
              )}
            </motion.div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center">
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

            {/* Right Side: Timer & Controls */}
            <div className="flex flex-col items-center justify-center order-1 md:order-2 space-y-6">
              {/* Task title */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center"
              >
                <h2 className="text-xl md:text-2xl font-bold text-[var(--charcoal)] mb-1">
                  Focusing on:
                </h2>
                <p className="text-2xl md:text-4xl font-bold text-[var(--clay-600)]">
                  {taskTitle}
                </p>
              </motion.div>

              {/* Timer */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className="text-6xl md:text-8xl font-bold text-[var(--charcoal)] mb-4 tracking-tight">
                  {formatTime(timeLeft)}
                </div>
              </motion.div>

              {/* Music Player */}
              <div className="w-full max-w-md">
                <FocusMusicPlayer isPlaying={!isPaused} />
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3 justify-center items-center">
                <button
                  onClick={togglePause}
                  className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  {isPaused ? (
                    <>
                      <Play className="w-5 h-5 md:w-6 md:h-6" />
                      Start
                    </>
                  ) : (
                    <>
                      <Pause className="w-5 h-5 md:w-6 md:h-6" />
                      Pause
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleExtendTime(1)}
                  className="bg-[var(--sage-500)] hover:bg-[var(--sage-600)] text-white rounded-full px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95"
                  title="Add 1 minute"
                >
                  <Plus className="w-5 h-5 md:w-6 md:h-6" />
                  1 min
                </button>

                <button
                  onClick={onEnd}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-[var(--charcoal)] border-2 border-[var(--stone)] rounded-full px-6 py-3 md:px-8 md:py-4 text-base md:text-lg font-semibold transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                  End Session
                </button>
              </div>
              
              {/* Pause indicator */}
              {isPaused && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <p className="text-xl text-[var(--clay-600)] font-semibold">⏸️ Paused</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
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
