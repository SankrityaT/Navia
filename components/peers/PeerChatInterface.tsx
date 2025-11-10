// FRONTEND: 1-on-1 peer chat interface (MVP)
// Simple messaging between accountability partners

'use client';

import { useState, useEffect, useRef } from 'react';
import { PeerMessage, PeerConnection } from '@/lib/types';
import { Send, Loader2, CheckCircle2, User, AlertTriangle, Settings, ArrowLeft } from 'lucide-react';
import { useMessageStore } from '@/lib/stores/messageStore';
import { useNotificationStore } from '@/lib/stores/notificationStore';
import ChatSettingsModal from './ChatSettingsModal';
import { useRouter } from 'next/navigation';

interface PeerChatInterfaceProps {
  connection: PeerConnection;
  currentUserId: string;
  peerName: string;
  peerRevealed?: boolean;
  myRevealed?: boolean;
}

export default function PeerChatInterface({ 
  connection, 
  currentUserId, 
  peerName,
  peerRevealed = false,
  myRevealed = false
}: PeerChatInterfaceProps) {
  const connectionId = connection.connection_id;
  const { 
    messages: allMessages, 
    isLoading: loadingStates, 
    setMessages, 
    addMessage, 
    setLoading,
    updateLastFetched,
    shouldFetch
  } = useMessageStore();
  const messages = allMessages[connectionId] || [];
  const isLoading = loadingStates[connectionId] || false;
  
  const [input, setInput] = useState('');
  const [isFetching, setIsFetching] = useState(true);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const addNotification = useNotificationStore(state => state.addNotification);
  const previousMessageCount = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Initial fetch
    fetchMessages();
    
    // Set up polling with cooldown
    const pollInterval = setInterval(() => {
      if (shouldFetch(connectionId)) {
        fetchMessages();
      }
    }, 5000); // Check every 5 seconds, but only fetch if cooldown passed
    
    return () => clearInterval(pollInterval);
  }, [connection.connection_id, shouldFetch]);

  useEffect(() => {
    scrollToBottom();
    
    // Check for new messages and create notifications
    if (messages.length > previousMessageCount.current && previousMessageCount.current > 0) {
      const newMessages = messages.slice(previousMessageCount.current);
      newMessages.forEach(msg => {
        if (msg.sender_id !== currentUserId) {
          addNotification({
            connectionId,
            peerName,
            message: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
            timestamp: msg.timestamp,
            read: false,
          });
        }
      });
    }
    previousMessageCount.current = messages.length;
  }, [messages, currentUserId, connectionId, peerName, addNotification]);

  const fetchMessages = async () => {
    // Skip if we recently fetched
    if (!shouldFetch(connectionId)) {
      return;
    }
    
    try {
      const response = await fetch(
        `/api/peers/messages/${connectionId}`
      );
      const data = await response.json();
      setMessages(connectionId, data.messages || []);
      updateLastFetched(connectionId);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleRevealName = async () => {
    setIsRevealing(true);
    try {
      const response = await fetch('/api/peers/reveal-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          connectionId: connectionId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setShowRevealModal(false);
        // Send a system message
        await handleSend(true);
        // Refresh the page to show updated name
        window.location.reload();
      } else {
        alert('Failed to reveal name. Please try again.');
      }
    } catch (error) {
      console.error('Reveal name error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsRevealing(false);
    }
  };

  const handleSend = async (isSystemMessage = false) => {
    if (!isSystemMessage && (!input.trim() || isLoading)) return;

    const messageContent = isSystemMessage ? '✨ I just revealed my real name!' : input;
    if (!isSystemMessage) setInput('');
    setLoading(connectionId, true);

    try {
      const response = await fetch(`/api/peers/messages/${connectionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add the new message to the store
        addMessage(connectionId, {
          message_id: data.message.id,
          connection_id: connectionId,
          sender_id: currentUserId,
          content: data.message.content,
          timestamp: data.message.created_at,
          read: false,
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      // Restore input on error
      setInput(messageContent);
    } finally {
      setLoading(connectionId, false);
    }
  };

  const formatTime = (timestamp: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.log('Invalid timestamp:', timestamp);
      return '';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);

    // If today (within 24 hours), show time
    if (diffHours < 24 && diffMs > 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    // If older than 24 hours, show date
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <div className="flex flex-col h-full bg-[var(--cream)]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--clay-300)]/20 bg-white backdrop-blur-md shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              onClick={() => router.push('/connections')}
              className="p-2 hover:bg-[var(--stone)] rounded-lg transition-colors flex-shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--charcoal)]" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center text-[var(--cream)] font-bold flex-shrink-0">
              {peerName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-[var(--charcoal)] truncate flex items-center gap-2">
                {peerName}
                {peerRevealed && (
                  <span className="text-xs px-2 py-0.5 bg-[var(--sage-100)] text-[var(--sage-700)] rounded-full font-medium">
                    Real Name
                  </span>
                )}
              </h2>
              <p className="text-xs text-[var(--charcoal)]/60">
                Accountability Partner
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!myRevealed && (
              <button
                onClick={() => setShowRevealModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--sage-100)] hover:bg-[var(--sage-200)] text-[var(--sage-700)] rounded-lg font-medium transition-all text-xs border border-[var(--sage-300)]"
              >
                <User className="w-3.5 h-3.5" />
                Reveal
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-[var(--stone)] rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-[var(--charcoal)]/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[var(--cream)]">
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
          messages.map((message, index) => {
            const isOwn = message.sender_id === currentUserId;
            const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
            
            return (
              <div
                key={`${message.message_id}-${index}`}
                className={`flex gap-2 ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
              >
                {!isOwn && showAvatar && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-600)] flex items-center justify-center text-sm font-bold text-[var(--cream)] flex-shrink-0 shadow-sm">
                    {peerName.charAt(0)}
                  </div>
                )}
                {!isOwn && !showAvatar && <div className="w-9" />}
                
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                      isOwn
                        ? 'bg-[var(--clay-500)] text-[var(--cream)]'
                        : 'bg-white text-[var(--charcoal)] border border-[var(--clay-300)]/20'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed text-[15px]">{message.content}</p>
                  </div>
                  {(message.timestamp || (message as any).created_at) && (
                    <p
                      className={`text-xs mt-1 px-2 ${
                        isOwn
                          ? 'text-right text-[var(--charcoal)]/60'
                          : 'text-left text-[var(--charcoal)]/60'
                      }`}
                    >
                      {formatTime(message.timestamp || (message as any).created_at)}
                    </p>
                  )}
                </div>
                
                {isOwn && showAvatar && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--sage-400)] to-[var(--sage-600)] flex items-center justify-center text-sm font-bold text-[var(--cream)] flex-shrink-0 shadow-sm">
                    {currentUserId.charAt(0).toUpperCase()}
                  </div>
                )}
                {isOwn && !showAvatar && <div className="w-9" />}
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[var(--clay-300)]/20 bg-white backdrop-blur-md flex-shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Message ${peerName}...`}
              className="w-full px-4 py-3 bg-white border border-[var(--clay-300)]/30 rounded-2xl focus:ring-2 focus:ring-[var(--clay-400)] focus:border-transparent text-[var(--charcoal)] placeholder:text-[var(--charcoal)]/40 resize-none max-h-[120px] transition-all"
              disabled={isLoading}
              rows={1}
              style={{ minHeight: '44px' }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 flex items-center justify-center bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Reveal Name Modal */}
      {showRevealModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--sand)] rounded-3xl shadow-2xl max-w-md w-full p-8">
            <style jsx>{`
              @keyframes fade-in-up {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              .animate-fade-in-up {
                animation: fade-in-up 0.3s ease-out;
              }
            `}</style>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-[var(--clay-100)] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-[var(--clay-600)]" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
                Reveal Your Real Name?
              </h3>
            </div>
            
            <div className="space-y-4 mb-6">
              <p className="text-[var(--charcoal)]/80">
                This will show your real name to {peerName} in this chat.
              </p>
              
              <div className="bg-[var(--clay-50)] border border-[var(--clay-300)] rounded-xl p-4">
                <p className="text-sm text-[var(--charcoal)]/70 font-medium mb-2">
                  ⚠️ Important:
                </p>
                <ul className="text-sm text-[var(--charcoal)]/70 space-y-1 list-disc list-inside">
                  <li>This action is <strong>irreversible</strong></li>
                  <li>Your name will be visible to them permanently</li>
                  <li>They can choose to reveal their name separately</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRevealModal(false)}
                disabled={isRevealing}
                className="flex-1 px-6 py-3 bg-[var(--stone)] hover:bg-[var(--clay-200)] text-[var(--charcoal)] rounded-2xl font-semibold transition-all border-2 border-[var(--clay-300)]/40 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRevealName}
                disabled={isRevealing}
                className="flex-1 px-6 py-3 bg-[var(--clay-500)] hover:bg-[var(--clay-600)] text-[var(--cream)] rounded-2xl font-semibold transition-all shadow-lg disabled:opacity-50"
              >
                {isRevealing ? 'Revealing...' : 'Yes, Reveal'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Settings Modal */}
      <ChatSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        peerName={peerName}
        connectionId={connectionId}
        onRemoveConnection={async () => {
          try {
            const response = await fetch('/api/peers/remove', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ connectionId }),
            });
            if (response.ok) {
              router.push('/connections');
            }
          } catch (error) {
            console.error('Remove connection error:', error);
          }
        }}
        onBlockUser={async () => {
          try {
            const peerId = connection.user1_id === currentUserId ? connection.user2_id : connection.user1_id;
            const response = await fetch('/api/peers/block', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ connectionId, blockedUserId: peerId }),
            });
            if (response.ok) {
              router.push('/connections');
            }
          } catch (error) {
            console.error('Block user error:', error);
          }
        }}
        onReportUser={() => {
          const reason = prompt('Please briefly describe the issue:');
          if (reason) {
            const peerId = connection.user1_id === currentUserId ? connection.user2_id : connection.user1_id;
            fetch('/api/peers/report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                reportedUserId: peerId,
                reason,
                description: reason
              }),
            }).then(() => {
              alert('Thank you for your report. Our team will review it shortly.');
            });
          }
        }}
      />
    </div>
  );
}
