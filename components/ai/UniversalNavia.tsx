'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, VolumeX } from 'lucide-react';
import NaviaAvatar from './NaviaAvatar';
import InteractiveBreakdown from './InteractiveBreakdown';

// Simple markdown renderer for basic formatting
const renderMarkdown = (text: string) => {
  return text
    // Bold: **text** or __text__
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic: *text* or _text_
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Code: `text`
    .replace(/`(.+?)`/g, '<code class="bg-[var(--sand)] px-1 rounded">$1</code>');
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
  emotions?: {
    topEmotion: string;
    emotionIntensity: 'low' | 'moderate' | 'high';
    allEmotions: Array<{ name: string; score: number }>;
  };
}

interface UniversalNaviaProps {
  mode: 'dashboard' | 'focus' | 'onboarding';
  context?: any;
  onMessage?: (message: string) => void;
  apiEndpoint?: string;
  showAvatar?: boolean;
  showInput?: boolean;
  className?: string;
  // Focus mode specific
  isAsleep?: boolean;
  onWake?: () => void;
  proactiveMessage?: string;
  // Message persistence
  initialMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

export default function UniversalNavia({
  mode = 'dashboard',
  context = {},
  onMessage,
  apiEndpoint = '/api/dashboard-chat',
  showAvatar = true,
  showInput = true,
  className = '',
  isAsleep = false,
  onWake,
  proactiveMessage,
  initialMessages = [],
  onMessagesChange,
}: UniversalNaviaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [breakdownData, setBreakdownData] = useState<any>(null); // For interactive breakdown
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const lastAutoSendRef = useRef<string | null>(null);
  const isAutoSendingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Notify parent of message changes
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // Show proactive message AND auto-send to API if there's context
  useEffect(() => {
    if (proactiveMessage && !isAsleep) {
      // Show the initial message (only if not already showing)
      setMessages(prev => {
        // Don't reset if we already have messages
        if (prev.length > 0 && prev[0].content === proactiveMessage) {
          return prev;
        }
        return [{ role: 'assistant', content: proactiveMessage }];
      });
      
      // Auto-send for task breakdown OR memory recall
      const shouldAutoSend = 
        (context && context.task && apiEndpoint.includes('task-breakdown')) ||
        (context && context.query && apiEndpoint.includes('memory-recall'));

      if (shouldAutoSend) {
        const contextSignature = JSON.stringify({
          endpoint: apiEndpoint,
          task: context?.task,
          query: context?.query,
        });

        if (isAutoSendingRef.current && lastAutoSendRef.current === contextSignature) {
          return;
        }

        lastAutoSendRef.current = contextSignature;
        isAutoSendingRef.current = true;

        // Auto-trigger API call with the context
        (async () => {
          setIsLoading(true);
          try {
            const response = await fetch(apiEndpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [{ role: 'user', content: proactiveMessage }],
                ...context, // Spread context directly (has memories, pendingTasks, queryType, etc.)
                mode,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              console.error('API Error:', errorData);
              throw new Error(`API returned ${response.status}: ${JSON.stringify(errorData)}`);
            }

            // Check if this is a breakdown (returns JSON, not stream)
            if (apiEndpoint.includes('task-breakdown')) {
              const data = await response.json();
              if (data.success && data.breakdown) {
                setBreakdownData({
                  taskName: data.task,
                  ...data.breakdown
                });
                setIsLoading(false);
                return;
              }
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            console.log('🎬 [UniversalNavia] Starting to read stream from:', apiEndpoint);

            while (true) {
              const { done, value } = await reader!.read();
              if (done) {
                console.log('✅ [UniversalNavia] Stream reading complete');
                break;
              }

              const chunk = decoder.decode(value);
              console.log('📦 [UniversalNavia] Raw chunk:', chunk.slice(0, 100));
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') continue;

                  try {
                    const parsed = JSON.parse(data);
                    console.log('✨ [UniversalNavia] Parsed content:', parsed.content);
                    assistantMessage += parsed.content;
                    
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMessage = newMessages[newMessages.length - 1];
                      
                      if (lastMessage?.role === 'assistant' && lastMessage.content === proactiveMessage) {
                        // Replace the initial message with the real response
                        newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantMessage };
                      } else if (lastMessage?.role === 'assistant' && lastMessage.content !== proactiveMessage) {
                        // Update existing assistant message
                        lastMessage.content = assistantMessage;
                      } else {
                        // Add new assistant message
                        newMessages.push({ role: 'assistant', content: assistantMessage });
                      }
                      
                      return newMessages;
                    });
                  } catch (e) {
                    // Ignore parse errors
                  }
                }
              }
            }

            if (voiceMode && assistantMessage) {
              await playHumeVoice(assistantMessage);
            }
          } catch (error) {
            console.error('Error auto-sending proactive message:', error);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "I'm having trouble connecting right now. Can you try again?" 
            }]);
          } finally {
            setIsLoading(false);
            isAutoSendingRef.current = false;
          }
        })();
      }
    }
  }, [proactiveMessage, isAsleep, context, apiEndpoint, mode, voiceMode, context?.query]);

  const playHumeVoice = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          instructions: 'Speak with a warm, soothing, friendly female voice. Sound caring and supportive.',
        }),
      });

      if (!response.ok) {
        setIsSpeaking(false);
        return;
      }

      const data = await response.json();
      
      if (!data.success || !data.audio) {
        setIsSpeaking(false);
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
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audio.play();
    } catch (error) {
      console.error('TTS error:', error);
      setIsSpeaking(false);
    }
  };

  const startVoiceRecording = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false; // Stop after one utterance
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let finalTranscriptAccumulator = '';

    recognition.onstart = () => {
      setIsRecording(true);
      setCurrentTranscript('');
      finalTranscriptAccumulator = '';
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptAccumulator += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      setCurrentTranscript(finalTranscriptAccumulator + interimTranscript);
    };

    recognition.onend = () => {
      const finalText = finalTranscriptAccumulator.trim();
      setIsRecording(false);
      setCurrentTranscript('');
      
      // Send message after state is cleared
      if (finalText) {
        setTimeout(() => sendMessage(finalText), 100);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      setCurrentTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);

    // Detect emotions from user's message using Hume AI
    let emotions = null;
    try {
      const emotionResponse = await fetch('/api/emotion-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSend }),
      });
      
      if (emotionResponse.ok) {
        emotions = await emotionResponse.json();
        console.log('🎭 Detected emotions:', emotions);
      }
    } catch (emotionError) {
      console.warn('Emotion detection failed, continuing without it:', emotionError);
      // Continue without emotions if detection fails
    }

    const userMessage: Message = { 
      role: 'user', 
      content: textToSend,
      emotions: emotions // Store emotions with the message
    };
    setMessages(prev => [...prev, userMessage]);

    if (onMessage) {
      onMessage(textToSend);
    }

    try {

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          context: { ...context, mode },
          emotions, // Include detected emotions
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

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
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.content;
              
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = assistantMessage;
                } else {
                  newMessages.push({ role: 'assistant', content: assistantMessage });
                }
                
                return newMessages;
              });
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
      }

      // Play Hume voice if voice mode is enabled
      if (voiceMode && assistantMessage) {
        await playHumeVoice(assistantMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm having trouble connecting right now. Can you try again?" 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input using Web Speech API
    setIsRecording(!isRecording);
  };

  const handleWake = () => {
    if (onWake) {
      onWake();
    }
  };

  return (
    <div className={`flex flex-col items-center h-full ${className}`}>
      {/* Interactive Breakdown Mode - Fullscreen */}
      {breakdownData && !isAsleep && (
        <div className="fixed inset-0 z-50 bg-[var(--cream)] flex flex-col items-center justify-start overflow-y-auto py-12">
          {/* Navia Logo & Title at Top */}
          <div className="flex flex-col items-center mb-8 flex-shrink-0">
            <NaviaAvatar
              isSpeaking={false}
              isThinking={false}
              size="md"
            />
            <h1 
              className="text-5xl font-bold text-[var(--charcoal)] mt-4" 
              style={{ fontFamily: 'var(--font-fraunces)' }}
            >
              Navia
            </h1>
          </div>
          
          <InteractiveBreakdown
            taskName={breakdownData.taskName}
            breakdown={breakdownData}
            onComplete={() => {
              setBreakdownData(null);
              // Close the modal by triggering parent close
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('closeNaviaModal'));
              }
            }}
          />
        </div>
      )}

      {/* Asleep State - Big and Prominent */}
      {isAsleep && !breakdownData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center space-y-8 flex-1"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-[12rem]"
          >
            💤
          </motion.div>
          <div className="text-center space-y-4">
            <p className="text-5xl font-bold text-[var(--charcoal)]" style={{ fontFamily: 'var(--font-fraunces)' }}>
              I'm resting
            </p>
            <p className="text-3xl text-[var(--sage-700)]">
              Click on me to wake me up 💛
            </p>
          </div>
          <button
            onClick={handleWake}
            className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white px-12 py-6 rounded-full text-2xl font-bold transition-all hover:shadow-2xl hover:scale-105 active:scale-95"
          >
            Wake Navia
          </button>
        </motion.div>
      )}
      {/* Navia Avatar */}
      {showAvatar && !breakdownData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 flex-shrink-0"
        >
          <NaviaAvatar
            isSpeaking={isSpeaking}
            isThinking={isLoading && !isSpeaking}
            size="lg"
          />
        </motion.div>
      )}

      {/* Navia Branding Title */}
      <h1 
        className="text-6xl font-bold text-[var(--charcoal)] text-center mb-4 flex-shrink-0" 
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        Navia
      </h1>

      {/* Loading Indicator - PROMINENT breathing effect */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-12 flex-shrink-0 flex flex-col items-center gap-6"
        >
          {/* Pulsing orb */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--sage-400)] to-[var(--clay-500)] blur-xl"
          />
          
          {/* Text */}
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-center"
          >
            <p className="text-3xl font-bold text-[var(--charcoal)] mb-2" style={{ fontFamily: 'var(--font-fraunces)' }}>
              NAVIA is thinking
            </p>
            <motion.p
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xl text-[var(--sage-600)]"
            >
              Crafting your response...
            </motion.p>
          </motion.div>
        </motion.div>
      )}

      {/* Messages - Scrollable container */}
      {!isAsleep && messages.length > 0 && (
        <div className="w-full max-w-3xl mb-8 space-y-6 overflow-y-auto flex-1 px-4" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div 
                className={`text-2xl text-center leading-relaxed whitespace-pre-line ${
                  message.role === 'user'
                    ? 'text-[var(--clay-600)] font-semibold'
                    : 'text-[var(--charcoal)]'
                }`}
                style={{ fontFamily: 'var(--font-dm-sans)' }}
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
              />
              
              {/* Emotion Display - Only for user messages */}
              {message.role === 'user' && message.emotions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 flex justify-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--sage-100)] to-[var(--clay-100)] rounded-full border-2 border-[var(--clay-200)]">
                    <span className="text-2xl">🎭</span>
                    <div className="text-sm">
                      <span className="font-bold text-[var(--clay-700)]">
                        {message.emotions.topEmotion}
                      </span>
                      <span className="text-[var(--sage-600)] ml-1">
                        ({message.emotions.emotionIntensity})
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Live Transcript (when recording) */}
      {isRecording && currentTranscript && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl mb-6"
        >
          <p className="text-lg text-center text-[var(--sage-700)] italic">
            {currentTranscript}
          </p>
        </motion.div>
      )}

      {/* Input - Centered like OnboardingV2 - Fixed at bottom */}
      {showInput && !isAsleep && (
        <div className="w-full max-w-2xl space-y-2 flex-shrink-0 px-2 md:px-0">
          <div className="flex gap-2 md:gap-3 justify-center items-center">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setShowPlaceholder(false)}
              onBlur={() => setShowPlaceholder(input.trim().length === 0)}
              onKeyPress={(e) => e.key === 'Enter' && !isRecording && sendMessage()}
              placeholder={isRecording ? "Listening..." : showPlaceholder ? "Message Navia..." : ''}
              disabled={isLoading || isRecording}
              className="flex-1 min-w-0 bg-white border-2 border-[var(--clay-400)] rounded-full px-4 md:px-8 py-3 md:py-4 text-base md:text-xl text-center text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] shadow-sm disabled:opacity-50"
            />
            
            <button
              onClick={() => setVoiceMode(!voiceMode)}
              className={`flex-shrink-0 ${
                voiceMode ? 'bg-[var(--sage-600)]' : 'bg-white border-2 border-[var(--clay-400)]'
              } ${voiceMode ? 'text-white' : 'text-[var(--charcoal)]'} rounded-full p-3 md:p-4 hover:opacity-80 transition-all shadow-sm`}
              title={voiceMode ? "Voice mode ON" : "Voice mode OFF"}
            >
              {voiceMode ? <Volume2 className="w-5 h-5 md:w-6 md:h-6" /> : <VolumeX className="w-5 h-5 md:w-6 md:h-6" />}
            </button>

            {voiceMode ? (
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`flex-shrink-0 ${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-[var(--clay-500)]'
                } hover:opacity-90 text-white rounded-full p-3 md:p-4 transition-all shadow-sm`}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                <Mic className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="flex-shrink-0 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full p-3 md:p-4 transition-all disabled:opacity-50 shadow-sm"
              >
                <Send className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
          </div>
          
          {voiceMode && (
            <p className="text-sm text-center text-[var(--sage-600)]">
              {isRecording ? "🎤 Recording... Click mic to stop" : "Click mic to speak"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
