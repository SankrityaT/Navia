'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NaviaAvatar from '@/components/ai/NaviaAvatar';

const SCRIPT_SEGMENTS = [
  { text: "Hey, I'm Navia.", start: 0, end: 1.5 },
  {
    text: "I remember everything you tell me, so you don't have to.",
    start: 1.5,
    end: 4,
  },
  {
    text: "I check in when you're stuck and adapt to how you're feeling.",
    start: 4,
    end: 7,
  },
  {
    text: 'I break overwhelming tasks into steps matched to your energy.',
    start: 7,
    end: 10,
  },
  {
    text: 'And I help you connect with others who understand the struggle.',
    start: 10,
    end: 15,
  },
];

const AUDIO_SRC = '/navia-solution-talking.mp3';

export default function PitchDeckPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const awaitingInteractionRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPlayback = useCallback((shouldRequestUnlock: boolean = true) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    audio.currentTime = 0;
    audio
      .play()
      .then(() => {
        setIsPlaying(true);
        setCurrentTime(0);
        setActiveSegmentIndex(0);
        setAudioError(null);
      })
      .catch(() => {
        setAudioError('Tap once to let Navia speak.');
        if (!shouldRequestUnlock) return;
        if (awaitingInteractionRef.current) return;

        awaitingInteractionRef.current = true;

        const unlock = () => {
          awaitingInteractionRef.current = false;
          document.removeEventListener('click', unlock);
          document.removeEventListener('keydown', unlock);
          startPlayback(false);
        };

        document.addEventListener('click', unlock, { once: true });
        document.addEventListener('keydown', unlock, { once: true });
      });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      startPlayback();
    }, 3000);

    return () => clearTimeout(timer);
  }, [startPlayback]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setAudioError(null);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      restartTimeoutRef.current = setTimeout(() => {
        setCurrentTime(0);
        setActiveSegmentIndex(0);
        startPlayback();
      }, 1500);
    };

    const handleError = () => {
      setAudioError("Unable to load Navia's audio.");
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [startPlayback]);

  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    let animationFrame: number;

    const syncTranscript = () => {
      if (audio.paused) return;

      const current = audio.currentTime;
      const durationValue = duration || audio.duration || 15;
      setCurrentTime(current);

      const segmentIdx = SCRIPT_SEGMENTS.findIndex(
        (segment) => current >= segment.start && current < segment.end
      );

      if (segmentIdx !== -1) {
        setActiveSegmentIndex(segmentIdx);
      } else if (current >= durationValue) {
        setActiveSegmentIndex(SCRIPT_SEGMENTS.length - 1);
      }

      animationFrame = requestAnimationFrame(syncTranscript);
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(syncTranscript);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, duration]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{
        backgroundImage: 'url(/naviabackg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/25" />

      <audio ref={audioRef} src={AUDIO_SRC} preload="metadata" className="hidden" />

      <div className="relative z-10 flex flex-col items-center justify-center space-y-12 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <NaviaAvatar isSpeaking={isPlaying} isThinking={false} size="8xl" />
        </motion.div>

        <AnimatePresence mode="wait">
          {(isPlaying || currentTime > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-3xl space-y-4"
            >
              {SCRIPT_SEGMENTS.map((segment, index) => {
                const isPast = currentTime >= segment.end;
                const isActiveSegment = index === activeSegmentIndex;
                return (
                  <motion.p
                    key={segment.text}
                    className={`text-3xl md:text-4xl leading-snug ${
                      isPast
                        ? 'text-white'
                        : isActiveSegment
                        ? 'text-[var(--sage-50)]'
                        : 'text-white/25'
                    }`}
                    style={{ fontFamily: 'var(--font-fraunces)' }}
                    animate={{
                      opacity: isPast ? 0.85 : isActiveSegment ? [0.4, 1, 0.4] : 0.2,
                    }}
                    transition={{ duration: isActiveSegment ? 1.2 : 0.3, repeat: isActiveSegment ? Infinity : 0 }}
                  >
                    {segment.text}
                  </motion.p>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {audioError && (
          <div className="bg-red-500/80 text-white px-6 py-3 rounded-full shadow-lg text-lg">
            {audioError}
          </div>
        )}
      </div>
    </div>
  );
}
