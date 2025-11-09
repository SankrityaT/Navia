// FRONTEND: 1-on-1 peer chat interface (MVP)
// Simple messaging between accountability partners

'use client';

import { useState, useEffect, useRef } from 'react';
import { PeerMessage, PeerConnection } from '@/lib/types';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

interface PeerChatInterfaceProps {
  connection: PeerConnection;
  currentUserId: string;
  peerName: string;
}

export default function PeerChatInterface({ 
  connection, 
  currentUserId,
  peerName 
}: PeerChatInterfaceProps) {
  const [messages, setMessages] = useState<PeerMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchMessages();
  }, [connection.connection_id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `/api/peers/messages?connectionId=${connection.connection_id}`
      );
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const tempMessage: PeerMessage = {
      message_id: `temp_${Date.now()}`,
      connection_id: connection.connection_id,
      sender_id: currentUserId,
      content: input,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/peers/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: connection.connection_id,
          content: input,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((msg) =>
            msg.message_id === tempMessage.message_id ? data.message : msg
          )
        );
      }
    } catch (error) {
      console.error('Send message error:', error);
      // Remove temp message on error
      setMessages((prev) =>
        prev.filter((msg) => msg.message_id !== tempMessage.message_id)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--sand)]/80 backdrop-blur-sm rounded-3xl shadow-xl border border-[var(--clay-300)]/30">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--clay-300)]/30">
        <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
          Chat with {peerName}
        </h2>
        <p className="text-sm text-[var(--charcoal)]/60 mt-1">
          Accountability Partnership
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {isFetching ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--clay-500)]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--sage-400)]/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-[var(--sage-600)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--charcoal)] mb-2">
              Start Your Accountability Partnership
            </h3>
            <p className="text-[var(--charcoal)]/60 max-w-sm">
              Say hi to {peerName}! Share what you're working on this week.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.message_id}
              className={`flex ${
                message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                  message.sender_id === currentUserId
                    ? 'bg-[var(--clay-500)] text-[var(--cream)]'
                    : 'bg-[var(--stone)] text-[var(--charcoal)]'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender_id === currentUserId
                      ? 'text-[var(--cream)]/70'
                      : 'text-[var(--charcoal)]/50'
                  }`}
                >
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-[var(--clay-300)]/30">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={`Message ${peerName}...`}
            className="flex-1 px-4 py-3 bg-[var(--cream)] border border-[var(--clay-300)]/40 rounded-2xl focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent text-[var(--charcoal)] placeholder:text-[var(--charcoal)]/40"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Send className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
