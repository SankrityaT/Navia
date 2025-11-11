'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Volume2, VolumeX } from 'lucide-react';
import NaviaAvatar from './NaviaAvatar';

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

  // Show proactive message if provided - only once, and auto-send it
  const hasShownProactive = useRef(false);
  const proactiveMessageRef = useRef<string>('');
  
  useEffect(() => {
    if (proactiveMessage && !isAsleep && proactiveMessage !== proactiveMessageRef.current) {
      proactiveMessageRef.current = proactiveMessage;
      
      console.log('🤖 [UniversalNavia] Auto-sending proactive message:', proactiveMessage);
      
      // Add user message and trigger AI response
      const userMessage: Message = { role: 'user', content: proactiveMessage };
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);
      
      // Send to API with full message history
      (async () => {
        try {
          const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: newMessages.map(({ role, content }) => ({ role, content })),
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

          if (voiceMode && assistantMessage) {
            await playHumeVoice(assistantMessage);
          }
        } catch (error) {
          console.error('Error sending proactive message:', error);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I'm having trouble connecting right now. Can you try again?" 
          }]);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [proactiveMessage, isAsleep, apiEndpoint, context, mode, voiceMode]);

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
    <div className={`flex flex-col items-center h-full ${className}`}>
      {/* Asleep State - Big and Prominent */}
      {isAsleep && (
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
      {showAvatar && (
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
        className="text-6xl font-bold text-[var(--charcoal)] text-center mb-8 flex-shrink-0" 
        style={{ fontFamily: 'var(--font-fraunces)' }}
      >
        Navia
      </h1>

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
        <div className="w-full max-w-2xl space-y-2 flex-shrink-0">
          <div className="flex gap-3 justify-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isRecording && sendMessage()}
              placeholder={isRecording ? "Listening..." : "Message Navia..."}
              disabled={isLoading || isRecording}
              className="flex-1 bg-white border-2 border-[var(--clay-400)] rounded-full px-8 py-4 text-xl text-center text-[var(--charcoal)] placeholder-[var(--sage-500)] focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] shadow-sm disabled:opacity-50"
            />
            
            <button
              onClick={() => setVoiceMode(!voiceMode)}
              className={`${
                voiceMode ? 'bg-[var(--sage-600)]' : 'bg-white border-2 border-[var(--clay-400)]'
              } ${voiceMode ? 'text-white' : 'text-[var(--charcoal)]'} rounded-full p-4 hover:opacity-80 transition-all shadow-sm`}
              title={voiceMode ? "Voice mode ON" : "Voice mode OFF"}
            >
              {voiceMode ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </button>

            {voiceMode ? (
              <button
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`${
                  isRecording ? 'bg-red-500 animate-pulse' : 'bg-[var(--clay-500)]'
                } hover:opacity-90 text-white rounded-full p-4 transition-all shadow-sm`}
                title={isRecording ? "Stop recording" : "Start recording"}
              >
                <Mic className="w-6 h-6" />
              </button>
            ) : (
              <button
                onClick={() => sendMessage()}
                disabled={isLoading || !input.trim()}
                className="bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-full p-4 transition-all disabled:opacity-50 shadow-sm"
              >
                <Send className="w-6 h-6" />
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
