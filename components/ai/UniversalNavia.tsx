'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, VolumeX } from 'lucide-react';
import NaviaAvatar from './NaviaAvatar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    // Notify parent of message changes
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // Show proactive message if provided
  useEffect(() => {
    if (proactiveMessage && !isAsleep) {
      setMessages(prev => [...prev, { role: 'assistant', content: proactiveMessage }]);
      if (voiceMode) {
        playHumeVoice(proactiveMessage);
      }
    }
  }, [proactiveMessage, isAsleep]);

  const playHumeVoice = async (text: string) => {
    try {
      setIsSpeaking(true);
      
      // Try Hume TTS first, fallback to regular TTS
      let response = await fetch('/api/hume-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      // Fallback to regular TTS if Hume fails
      if (!response.ok) {
        console.log('Hume TTS not available, using fallback TTS');
        response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text }),
        });
      }

      if (!response.ok) throw new Error('TTS failed');

      const audioBlob = await response.blob();
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

    const userMessage: Message = { role: 'user', content: textToSend };
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
    <div className={`flex flex-col ${className}`}>
      {/* Navia Avatar */}
      {showAvatar && (
        <div className="flex flex-col items-center mb-4">
          <div 
            className={`relative ${isAsleep ? 'cursor-pointer' : ''}`}
            onClick={isAsleep ? handleWake : undefined}
          >
            <NaviaAvatar
              isSpeaking={isSpeaking}
              isThinking={isLoading && !isSpeaking}
              size="lg"
            />
            
            {/* Sleep indicator with animation */}
            {isAsleep && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ 
                  opacity: [0.5, 1, 0.5],
                  y: [-10, -15, -10],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2"
              >
                <div className="flex items-center gap-1">
                  <motion.span 
                    className="text-3xl"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >
                    Z
                  </motion.span>
                  <motion.span 
                    className="text-2xl"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  >
                    z
                  </motion.span>
                  <motion.span 
                    className="text-xl"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  >
                    z
                  </motion.span>
                </div>
              </motion.div>
            )}
          </div>
          
          {isAsleep && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-[var(--sage-600)] mt-2 text-center italic"
            >
              Touch me if you need help 💛
            </motion.p>
          )}
        </div>
      )}

      {/* Messages */}
      {!isAsleep && messages.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-96">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-[var(--clay-500)] text-white'
                    : 'bg-[var(--sand)] text-[var(--charcoal)]'
                }`}
              >
                {message.content}
              </div>
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
          className="bg-[var(--sage-100)] border border-[var(--sage-300)] rounded-2xl px-4 py-3 mb-4"
        >
          <p className="text-sm text-[var(--sage-700)] italic">
            {currentTranscript}
          </p>
        </motion.div>
      )}

      {/* Input */}
      {showInput && !isAsleep && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isRecording && sendMessage()}
              placeholder={isRecording ? "Listening..." : "Message Navia..."}
              disabled={isLoading || isRecording}
              className="flex-1 bg-white border border-[var(--stone)] rounded-full px-6 py-3 text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] disabled:opacity-50"
            />
            
            <button
              onClick={() => setVoiceMode(!voiceMode)}
              className={`${
                voiceMode ? 'bg-[var(--sage-600)]' : 'bg-white border border-[var(--stone)]'
              } ${voiceMode ? 'text-white' : 'text-[var(--charcoal)]'} rounded-full p-3 hover:opacity-80 transition-all`}
              title={voiceMode ? "Voice mode ON" : "Voice mode OFF"}
            >
              {voiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>

            {voiceMode ? (
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-[var(--clay-500)]'
                } hover:opacity-90 text-white rounded-full p-3 transition-all`}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                <Mic className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full p-3 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {voiceMode && (
            <p className="text-xs text-center text-[var(--sage-600)]">
              {isRecording ? "🎤 Recording... Click mic to stop" : "Click mic to speak"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
