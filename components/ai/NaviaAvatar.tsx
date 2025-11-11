'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface NaviaAvatarProps {
  isThinking?: boolean;
  isSpeaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function NaviaAvatar({ 
  isThinking = false, 
  isSpeaking = false,
  size = 'md' 
}: NaviaAvatarProps) {
  const [pulsePhase, setPulsePhase] = useState(0);

  useEffect(() => {
    if (isSpeaking) {
      const interval = setInterval(() => {
        setPulsePhase((prev) => (prev + 1) % 3);
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isSpeaking]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-40 h-40', // Bigger for onboarding
  };

  return (
    <div className={`relative ${sizeClasses[size]} mx-auto`}>
      {/* Outer glow ring - pulses when speaking */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(201, 125, 86, 0.4) 0%, rgba(138, 155, 128, 0.2) 50%, transparent 70%)',
        }}
        animate={isSpeaking ? {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        } : {
          scale: 1,
          opacity: 0.3,
        }}
        transition={{
          duration: 1.5,
          repeat: isSpeaking ? Infinity : 0,
          ease: 'easeInOut',
        }}
      />

      {/* Main gradient orb */}
      <motion.div
        className="absolute inset-2 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #C97D56 0%, #8A9B80 50%, #D89B76 100%)',
          boxShadow: '0 0 30px rgba(201, 125, 86, 0.5)',
        }}
        animate={isThinking ? {
          rotate: 360,
        } : isSpeaking ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          rotate: {
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          },
          scale: {
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      />

      {/* Inner highlight */}
      <motion.div
        className="absolute inset-4 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.8) 0%, transparent 60%)',
        }}
        animate={{
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Speaking indicator - animated dots */}
      {isSpeaking && (
        <div className="absolute inset-0 flex items-center justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 bg-white rounded-full"
              animate={{
                y: pulsePhase === i ? -4 : 0,
                opacity: pulsePhase === i ? 1 : 0.5,
              }}
              transition={{
                duration: 0.2,
              }}
            />
          ))}
        </div>
      )}

      {/* Thinking indicator - rotating ring */}
      {isThinking && !isSpeaking && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-white border-t-transparent"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      )}
    </div>
  );
}
