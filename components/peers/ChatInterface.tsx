'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MockPeer } from '@/lib/mock/peers';

interface ChatMessage {
  id: string;
  from: 'user' | 'peer';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  peer: MockPeer;
  peerId: string;
}

export default function ChatInterface({ peer, peerId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    const chatKey = `chat_${peerId}`;
    const saved = localStorage.getItem(chatKey);
    
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // Initialize with a welcome message from peer
      const welcomeMessage: ChatMessage = {
        id: '0',
        from: 'peer',
        content: `Hey! Thanks for reaching out. I'm excited to connect! 💛`,
        timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMessage]);
      localStorage.setItem(chatKey, JSON.stringify([welcomeMessage]));
    }
  }, [peerId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      from: 'user',
      content: inputValue,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');

    // Save to localStorage
    const chatKey = `chat_${peerId}`;
    localStorage.setItem(chatKey, JSON.stringify(newMessages));

    // Simulate peer response after a delay
    setTimeout(() => {
      const responses = [
        "That makes so much sense! I've been there too.",
        "Thanks for sharing that. I really appreciate your openness.",
        "I totally get what you mean. Have you tried [strategy]?",
        "That's really insightful. I hadn't thought of it that way.",
        "I'm here for you! We can figure this out together.",
        "That sounds challenging. How are you coping with it?",
      ];
      
      const peerMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        from: 'peer',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date().toISOString(),
      };

      const updatedMessages = [...newMessages, peerMessage];
      setMessages(updatedMessages);
      localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
      setIsSending(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-white border-b-2 border-[var(--stone)] p-6 flex items-center gap-4">
        <div className="text-4xl">{peer.avatar}</div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-[var(--charcoal)]" style={{ fontFamily: 'var(--font-fraunces)' }}>
            {peer.name}
          </h2>
          <p className="text-sm text-[var(--clay-600)]">
            {peer.matchScore}% Match
          </p>
        </div>
        <div className="px-3 py-1 bg-[var(--sage-100)] text-[var(--sage-700)] rounded-full text-sm font-medium">
          Anonymous
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[var(--cream)]">
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`flex ${message.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.from === 'user'
                    ? 'bg-[var(--clay-500)] text-white'
                    : 'bg-white border-2 border-[var(--stone)] text-[var(--charcoal)]'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.from === 'user' ? 'text-white/70' : 'text-[var(--clay-600)]'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isSending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border-2 border-[var(--stone)] rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t-2 border-[var(--stone)] p-6">
        <div className="flex gap-4">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-4 border-2 border-[var(--stone)] rounded-2xl resize-none focus:outline-none focus:border-[var(--clay-500)] transition-all"
            rows={2}
            maxLength={1000}
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="px-6 py-4 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-white rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed self-end"
          >
            Send 💛
          </button>
        </div>
        <p className="text-sm text-[var(--clay-600)] mt-2 text-right">
          {inputValue.length}/1000
        </p>
      </div>
    </div>
  );
}
