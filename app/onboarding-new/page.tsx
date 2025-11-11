'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import NaviaAvatar from '@/components/ai/NaviaAvatar';
import VoiceInput from '@/components/ai/VoiceInput';
import { Send, Sparkles } from 'lucide-react';

interface Message {
  role: 'assistant' | 'user';
  content: string;
}

export default function OnboardingNew() {
  const router = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Play audio using Hume TTS (optional - gracefully degrades if unavailable)
  const playAudio = async (text: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          instructions: 'Speak with a warm, friendly, and encouraging tone. Sound supportive and caring, like a helpful friend.',
        }),
      });

      if (!response.ok) return; // Silently fail if TTS unavailable

      const data = await response.json();
      
      // TTS is optional - if not available, just continue
      if (!data.success || !data.audio) {
        return;
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0))],
        { type: data.mimeType }
      );
      const audioUrl = URL.createObjectURL(audioBlob);

      if (audioRef.current) {
        audioRef.current.pause();
      }

      audioRef.current = new Audio(audioUrl);
      audioRef.current.play();
    } catch (error) {
      // Silently continue without audio - it's not critical
    }
  };

  // Start conversation automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      sendInitialMessage();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const sendInitialMessage = async () => {
    setIsLoading(true);
    setIsSpeaking(true);

    try {
      const response = await fetch('/api/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Start onboarding' }],
        }),
      });

      if (!response.ok) throw new Error('Failed to start onboarding');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsSpeaking(false);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.content;
              setMessages([{ role: 'assistant', content: assistantMessage }]);
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }
      
      // Play audio for initial message
      if (assistantMessage) {
        playAudio(assistantMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      const fallbackMessage = "Hi! I'm Navia 💛 I'm here to help you navigate life after college. What should I call you?";
      setMessages([
        {
          role: 'assistant',
          content: fallbackMessage,
        },
      ]);
      playAudio(fallbackMessage);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsSpeaking(true);
    setQuestionCount((prev) => prev + 1);

    // Detect emotions from user message
    let detectedEmotions = null;
    try {
      const emotionResponse = await fetch('/api/emotion-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage }),
      });
      
      if (emotionResponse.ok) {
        detectedEmotions = await emotionResponse.json();
        setCurrentEmotion(detectedEmotions.topEmotion);
      }
    } catch (error) {
      console.log('Emotion detection unavailable');
    }

    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch('/api/onboarding-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setIsSpeaking(false);
              break;
            }
            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.content;
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantMessage;
                return newMessages;
              });
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Check if onboarding is complete (after 2 exchanges - name + need)
      if (questionCount >= 2) {
        // Play completion audio if available
        playAudio(assistantMessage);
        
        setTimeout(() => {
          router.push('/dashboard-new');
        }, 4000);
      } else {
        // Play audio for each response
        playAudio(assistantMessage);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble connecting. Let's try that again!" },
      ]);
      setIsSpeaking(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl flex flex-col items-center">
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Sparkles className="w-16 h-16 text-[var(--clay-500)] mx-auto mb-4" />
              </motion.div>
              <h1 className="text-4xl font-bold text-[var(--charcoal)] mb-2">Welcome to Navia</h1>
              <p className="text-[var(--clay-600)]">Your AI companion is getting ready...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {!showWelcome && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full flex flex-col items-center"
          >
            {/* Large Avatar - No borders, centered */}
            <div className="mb-8">
              <NaviaAvatar isSpeaking={isSpeaking} isThinking={isLoading && !isSpeaking} size="lg" />
            </div>
            
            {/* Title */}
            <h1 className="text-5xl font-bold text-[var(--charcoal)] text-center mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>Navia</h1>
            <p className="text-lg text-[var(--clay-600)] text-center mb-2">Your AI Companion</p>
            
            {/* Emotion indicator */}
            {currentEmotion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-sm text-[var(--sage-600)] mb-8"
              >
                Sensing: {currentEmotion}
              </motion.div>
            )}

            {/* Chat Messages - No container, just messages */}
            <div className="w-full max-w-3xl overflow-y-auto space-y-6 mb-8 px-4" style={{ maxHeight: '50vh' }}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-3xl px-6 py-4 shadow-sm ${
                      message.role === 'user'
                        ? 'bg-[var(--clay-500)] text-white'
                        : 'bg-white text-[var(--charcoal)]'
                    }`}
                  >
                    <p className="text-base leading-relaxed" style={{ fontFamily: 'var(--font-dm-sans)' }}>{message.content}</p>
                  </div>
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input - Larger, more prominent with voice option */}
            <form onSubmit={sendMessage} className="w-full max-w-3xl px-4">
              <div className="flex gap-3 items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type or speak your message..."
                  disabled={isLoading}
                  className="flex-1 bg-white border-2 border-[var(--clay-400)] rounded-full px-8 py-4 text-lg text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] focus:border-[var(--clay-500)] disabled:opacity-50 shadow-sm"
                  style={{ fontFamily: 'var(--font-dm-sans)' }}
                />
                <VoiceInput
                  onTranscript={(text, emotions) => {
                    setInput(text);
                    if (emotions) {
                      setCurrentEmotion(emotions.topEmotion);
                    }
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="bg-[var(--clay-500)] text-white rounded-full p-4 hover:bg-[var(--clay-600)] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </div>
    </div>
  );
}
