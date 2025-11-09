'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { generateAnonymousName } from '@/lib/utils/anonymousNames';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ConnectionInfo {
  peer_id: string;
  peer_name: string;
  status: string;
}

export default function PeerChatPage() {
  const params = useParams();
  const router = useRouter();
  const connectionId = params.connectionId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConnectionInfo();
    fetchMessages();
    
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [connectionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      if (data.profile?.clerk_user_id) {
        setCurrentUserId(data.profile.clerk_user_id);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchConnectionInfo = async () => {
    try {
      const response = await fetch(`/api/peers/connections/${connectionId}`);
      const data = await response.json();
      if (data.connection) {
        setConnectionInfo(data.connection);
      }
    } catch (error) {
      console.error('Error fetching connection info:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/peers/messages/${connectionId}`);
      const data = await response.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch(`/api/peers/messages/${connectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        await fetchMessages();
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--clay-500)]" />
        </div>
      </AuthenticatedLayout>
    );
  }

  const peerName = connectionInfo?.peer_id 
    ? generateAnonymousName(connectionInfo.peer_id)
    : 'Peer';

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-[var(--cream)] flex flex-col">
        {/* Header */}
        <div className="bg-[var(--sand)]/95 backdrop-blur-md border-b border-[var(--clay-300)]/30 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => router.push('/connections')}
              className="p-2 hover:bg-[var(--clay-100)] rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--charcoal)]" />
            </button>
            <div>
              <h1 className="text-xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                {peerName}
              </h1>
              <p className="text-sm text-[var(--charcoal)]/60">Accountability Partner</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-[var(--charcoal)]/60 mb-2">No messages yet</p>
                <p className="text-sm text-[var(--charcoal)]/40">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.sender_id === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-[var(--clay-500)] text-[var(--cream)]'
                          : 'bg-[var(--sand)] text-[var(--charcoal)] border border-[var(--clay-300)]/30'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${isMe ? 'text-[var(--cream)]/70' : 'text-[var(--charcoal)]/50'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-[var(--sand)]/95 backdrop-blur-md border-t border-[var(--clay-300)]/30 sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                disabled={sending}
                className="flex-1 px-4 py-3 bg-white border border-[var(--clay-300)]/40 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--clay-500)] focus:border-transparent disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
