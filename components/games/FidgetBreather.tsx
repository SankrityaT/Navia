'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Sparkles } from 'lucide-react';

/**
 * FidgetBreather - A calming, interactive breathing/fidget game
 * Designed for neurodivergent individuals with ADHD/autism
 * Features:
 * - Visual breathing guide with expanding/contracting circle
 * - Interactive color-changing orb you can drag
 * - Calming animations and haptic-like feedback
 * - Simple, distraction-free interface
 */

export default function FidgetBreather() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [orbPosition, setOrbPosition] = useState({ x: 0, y: 0 });
  const [orbColor, setOrbColor] = useState('#9ca986'); // sage color
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [completedBreaths, setCompletedBreaths] = useState(0);

  const colors = [
    '#9ca986', // sage
    '#c4a57b', // clay
    '#6b8e6f', // darker sage
    '#b89968', // darker clay
    '#8fbc8f', // light green
    '#daa520', // goldenrod
  ];

  // Breathing cycle: 4s inhale, 4s hold, 6s exhale
  useEffect(() => {
    if (!isBreathing) return;

    const phases = [
      { phase: 'inhale' as const, duration: 4000 },
      { phase: 'hold' as const, duration: 4000 },
      { phase: 'exhale' as const, duration: 6000 },
    ];

    let currentPhaseIndex = 0;
    let timeout: NodeJS.Timeout;

    const runPhase = () => {
      const { phase, duration } = phases[currentPhaseIndex];
      setBreathPhase(phase);

      timeout = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length;
        if (currentPhaseIndex === 0) {
          setCompletedBreaths((prev: number) => prev + 1);
        }
        runPhase();
      }, duration);
    };

    runPhase();

    return () => clearTimeout(timeout);
  }, [isBreathing]);

  const handleOrbDrag = (event: any, info: any) => {
    setOrbPosition({ x: info.offset.x, y: info.offset.y });
    
    // Change color on drag
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    setOrbColor(randomColor);
  };

  const resetOrb = () => {
    setOrbPosition({ x: 0, y: 0 });
    setOrbColor(colors[0]);
  };

  const toggleBreathing = () => {
    setIsBreathing(!isBreathing);
    if (!isBreathing) {
      setCompletedBreaths(0);
    }
  };

  const getBreathingScale = () => {
    if (breathPhase === 'inhale') return 1.5;
    if (breathPhase === 'hold') return 1.5;
    return 1;
  };

  const getBreathingText = () => {
    if (breathPhase === 'inhale') return 'Breathe In...';
    if (breathPhase === 'hold') return 'Hold...';
    return 'Breathe Out...';
  };

  return (
    <div className="relative bg-gradient-to-br from-[var(--sage-400)]/20 via-white to-[var(--sage-300)]/20 rounded-[2rem] p-6 border-2 border-[var(--sage-400)]/30 shadow-lg overflow-hidden">
      {/* Background particles */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--sage-400)]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[var(--sage-500)]/10 rounded-full blur-2xl animate-pulse delay-700"></div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] flex items-center justify-center shadow-md animate-pulse">
              <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                Calm Space ✨
              </h3>
              <p className="text-xs text-[var(--sage-600)] font-semibold">
                Breathe & Play
              </p>
            </div>
          </div>
          
          {/* Breath counter */}
          {completedBreaths > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-[var(--sage-400)] to-[var(--sage-500)] rounded-full shadow-lg"
            >
              <span className="text-lg">🌟</span>
              <span className="text-lg font-black text-white">{completedBreaths}</span>
            </motion.div>
          )}
        </div>

        {/* Main interaction area */}
        <div 
          ref={containerRef}
          className="relative h-64 bg-white/50 rounded-2xl border-2 border-[var(--sage-300)] overflow-hidden mb-4"
        >
          {/* Breathing circle */}
          <AnimatePresence>
            {isBreathing && (
              <motion.div
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ 
                  scale: getBreathingScale(),
                  opacity: breathPhase === 'hold' ? 0.5 : 0.3,
                }}
                exit={{ scale: 1, opacity: 0 }}
                transition={{ 
                  duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 4 : 6,
                  ease: 'easeInOut'
                }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--sage-400)] to-[var(--sage-600)] opacity-40"></div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Draggable orb */}
          <motion.div
            drag
            dragConstraints={containerRef}
            dragElastic={0.1}
            onDrag={handleOrbDrag}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            animate={{
              x: orbPosition.x,
              y: orbPosition.y,
              scale: isDragging ? 1.2 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `radial-gradient(circle at 30% 30%, ${orbColor}dd, ${orbColor})`,
              boxShadow: `0 8px 32px ${orbColor}66`,
            }}
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-full h-full rounded-full"
              style={{
                background: `radial-gradient(circle at 30% 30%, white, transparent)`,
                opacity: 0.3,
              }}
            />
          </motion.div>

          {/* Breathing text */}
          {isBreathing && (
            <motion.div
              key={breathPhase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center"
            >
              <p className="text-2xl font-bold text-[var(--sage-700)]">
                {getBreathingText()}
              </p>
            </motion.div>
          )}

          {/* Instructions when not active */}
          {!isBreathing && !isDragging && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <p className="text-[var(--sage-600)] text-sm text-center px-4">
                Drag the orb around or start breathing 💛
              </p>
            </motion.div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={toggleBreathing}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all shadow-md ${
              isBreathing
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[var(--sage-600)] hover:bg-[var(--sage-700)] text-white'
            }`}
          >
            {isBreathing ? (
              <>
                <Pause className="w-4 h-4" />
                <span className="text-sm">Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span className="text-sm">Breathe</span>
              </>
            )}
          </button>

          <button
            onClick={resetOrb}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-[var(--sand)] border-2 border-[var(--sage-300)] text-[var(--sage-700)] rounded-full font-semibold transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Reset</span>
          </button>
        </div>

        {/* Tips */}
        <div className="mt-4 bg-[var(--sage-100)] rounded-lg p-3 border border-[var(--sage-300)]">
          <p className="text-xs text-[var(--sage-800)] text-center">
            <span className="font-bold">💡 Tip:</span> Drag the orb to change colors, or follow the breathing guide to calm your mind
          </p>
        </div>
      </div>
    </div>
  );
}
