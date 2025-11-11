// FRONTEND: Main chat interface with persona detection - Enhanced with streaming and modern UI
// TODO: Add voice input option
// TODO: Store chat history locally

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircle, ChevronDown, ChevronUp, ExternalLink, ChevronLeft, ChevronRight, Clock, ThumbsUp, ThumbsDown, Lock } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona?: string;
  personaIcon?: string;
  timestamp: Date;
  functionCall?: any;
  breakdown?: string[];
  breakdownTips?: string[]; // Tips for task breakdown
  resources?: Array<{ title: string; url: string; description?: string; type?: string }>;
  sources?: Array<{ title: string; url: string; excerpt?: string }>;
  suggestBreakdown?: boolean;
  originalQuery?: string;
  isStreaming?: boolean; // For streaming animation
  messageId?: string; // DB ID for stored messages
  userFeedback?: boolean | null; // Current feedback state (true = thumbs up, false = thumbs down, null = no feedback)
  feedbackLocked?: boolean; // Whether feedback is locked after 2 toggles
}

interface ChatInterfaceProps {
  userContext?: {
    ef_profile?: string[];
    current_goals?: string[];
    energy_level?: number;
  };
}

interface HistoryItem {
  id: string;
  message: string;
  response: string;
  category: 'finance' | 'career' | 'daily_task';
  created_at: string;
  user_feedback?: boolean | null;
  metadata?: {
    feedbackToggleCount?: number;
    [key: string]: any;
  };
}

export default function ChatInterface({ userContext }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm Navia, your AI executive function coach. 💚\n\nI'm here to support you with career planning, managing finances, organizing daily tasks, and more—without any masking required. Just tell me what's on your mind, and we'll figure it out together.",
      persona: 'daily_tasks',
      personaIcon: '🏠',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentPersona, setCurrentPersona] = useState<string>('daily_tasks');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [chatHistory, setChatHistory] = useState<HistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [messageFeedback, setMessageFeedback] = useState<Record<string, { value: boolean | null, toggleCount: number }>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history on mount
  const fetchChatHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await fetch('/api/chat/history?limit=5');
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chatHistory || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  const handleViewHistory = (historyItem: HistoryItem) => {
    // Save current messages if not already viewing history
    if (!viewingHistoryId) {
      setCurrentMessages(messages);
    }

    // Load feedback state from history
    const toggleCount = historyItem.metadata?.feedbackToggleCount || 0;
    const isLocked = toggleCount >= 2;
    
    // Update feedback state
    setMessageFeedback({
      [historyItem.id]: {
        value: historyItem.user_feedback ?? null,
        toggleCount: toggleCount,
      },
    });

    // Create message objects from history item
    const historicalMessages: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm Navia, your AI executive function coach. 💚\n\nI'm here to support you with career planning, managing finances, organizing daily tasks, and more—without any masking required. Just tell me what's on your mind, and we'll figure it out together.",
        persona: 'daily_tasks',
        personaIcon: '🏠',
        timestamp: new Date(),
      },
      {
        id: `history-user-${historyItem.id}`,
        role: 'user',
        content: historyItem.message,
        timestamp: new Date(historyItem.created_at),
      },
      {
        id: `history-assistant-${historyItem.id}`,
        role: 'assistant',
        content: historyItem.response,
        persona: historyItem.category,
        personaIcon: getPersonaIcon(historyItem.category),
        timestamp: new Date(historyItem.created_at),
        messageId: historyItem.id,
        userFeedback: historyItem.user_feedback ?? null,
        feedbackLocked: isLocked,
      },
    ];

    setMessages(historicalMessages);
    setViewingHistoryId(historyItem.id);
    setCurrentPersona(historyItem.category);
  };

  const handleBackToCurrentChat = () => {
    setMessages(currentMessages.length > 0 ? currentMessages : [
      {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm Navia, your AI executive function coach. 💚\n\nI'm here to support you with career planning, managing finances, organizing daily tasks, and more—without any masking required. Just tell me what's on your mind, and we'll figure it out together.",
        persona: 'daily_tasks',
        personaIcon: '◆',
        timestamp: new Date(),
      },
    ]);
    setViewingHistoryId(null);
  };

  const handleSend = async (messageText?: string, forceBreakdown?: boolean) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Get recent session messages for context (excluding welcome message)
      // IMPORTANT: Include the message we just sent! (messages state hasn't updated yet)
      const sessionMessages = [...messages, userMessage]
        .slice(1) // Skip welcome message
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({
          role: m.role,
          content: m.content,
        }));
      
      console.log('🔍 Sending to API:', {
        query: textToSend,
        sessionMessagesCount: sessionMessages.length,
        sessionMessages: sessionMessages.slice(-4), // Show last 4 for debugging
      });
      
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: textToSend,
          userContext,
          sessionMessages, // Include current session for follow-ups!
          forceBreakdown: forceBreakdown || false,
        }),
      });

      const data = await response.json();

      // Update persona immediately
      const newPersona = data.domains?.[0] || data.persona || 'daily_tasks';
      setCurrentPersona(newPersona);

      // Simulate streaming effect
      const assistantMessageId = (Date.now() + 1).toString();
      const fullContent = data.summary || data.message;
      const dbMessageId = data.metadata?.messageId; // Get DB message ID for feedback
      
      // Initialize feedback state for new message
      if (dbMessageId) {
        setMessageFeedback((prev) => ({
          ...prev,
          [dbMessageId]: {
            value: null,
            toggleCount: 0,
          },
        }));
      }
      
      // Add empty message first
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        persona: newPersona,
        personaIcon: getPersonaIcon(newPersona),
        timestamp: new Date(),
        functionCall: data.functionCall,
        breakdown: data.breakdown,
        breakdownTips: data.breakdownTips,
        resources: data.resources,
        sources: data.sources,
        suggestBreakdown: data.metadata?.needsBreakdown && (!data.breakdown || data.breakdown.length === 0),
        originalQuery: textToSend,
        isStreaming: true,
        messageId: dbMessageId, // Add DB message ID
        userFeedback: null,
        feedbackLocked: false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
      
      // Stream the content character by character
      const words = fullContent.split(' ');
      for (let i = 0; i < words.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 30)); // Faster streaming
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === assistantMessageId
              ? { ...msg, content: words.slice(0, i + 1).join(' ') + (i < words.length - 1 ? ' ' : '') }
              : msg
          )
        );
      }
      
      // Mark streaming complete
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
        )
      );

      // Refresh chat history after successful message
      fetchChatHistory();
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreakdownResponse = async (accept: boolean, originalQuery: string) => {
    if (accept) {
      // User accepted - resend query with explicit breakdown request
      // This triggers the explicitlyRequestsBreakdown() check in backend
      const explicitRequest = `${originalQuery} - create a plan for this`;
      await handleSend(explicitRequest, false);
    } else {
      // User declined, just acknowledge
      const declineMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "No problem! Let me know if you need anything else.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, declineMessage]);
    }
  };

  const handleFeedback = async (messageId: string, feedback: boolean) => {
    if (!messageId) return;

    // Get current state
    const currentState = messageFeedback[messageId] || { value: null, toggleCount: 0 };
    
    // Check if locked
    if (currentState.toggleCount >= 2) {
      // Show a brief notification (you could use a toast library here)
      alert('Feedback is locked after 2 changes');
      return;
    }

    // Determine new feedback value (toggle if clicking same button)
    const newFeedback = currentState.value === feedback ? null : feedback;

    // Optimistically update UI
    const newToggleCount = currentState.value === newFeedback ? currentState.toggleCount : currentState.toggleCount + 1;
    setMessageFeedback((prev) => ({
      ...prev,
      [messageId]: {
        value: newFeedback,
        toggleCount: newToggleCount,
      },
    }));

    // Update message in state
    setMessages((prev) => 
      prev.map((msg) => 
        msg.messageId === messageId
          ? { ...msg, userFeedback: newFeedback, feedbackLocked: newToggleCount >= 2 }
          : msg
      )
    );

    try {
      // Call API to persist feedback
      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messageId,
          feedback: newFeedback,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        // Revert on error
        setMessageFeedback((prev) => ({
          ...prev,
          [messageId]: currentState,
        }));
        setMessages((prev) => 
          prev.map((msg) => 
            msg.messageId === messageId
              ? { ...msg, userFeedback: currentState.value, feedbackLocked: currentState.toggleCount >= 2 }
              : msg
          )
        );
        
        if (data.locked) {
          alert('Feedback is locked after 2 changes');
        } else {
          alert('Failed to update feedback. Please try again.');
        }
      } else {
        // Update with server response
        setMessageFeedback((prev) => ({
          ...prev,
          [messageId]: {
            value: data.feedback,
            toggleCount: data.toggleCount,
          },
        }));
        setMessages((prev) => 
          prev.map((msg) => 
            msg.messageId === messageId
              ? { ...msg, userFeedback: data.feedback, feedbackLocked: data.locked }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error updating feedback:', error);
      // Revert on error
      setMessageFeedback((prev) => ({
        ...prev,
        [messageId]: currentState,
      }));
      setMessages((prev) => 
        prev.map((msg) => 
          msg.messageId === messageId
            ? { ...msg, userFeedback: currentState.value, feedbackLocked: currentState.toggleCount >= 2 }
            : msg
        )
      );
      alert('Failed to update feedback. Please try again.');
    }
  };

  const getPersonaIcon = (persona: string) => {
    const icons: Record<string, string> = {
      career: '◈',
      finance: '💵',
      daily_task: '🏠',
      daily_tasks: '🏠',
    };
    return icons[persona] || '🏠';
  };

  const getPersonaLabel = (persona: string) => {
    const labels: Record<string, string> = {
      career: 'Career',
      finance: 'Finance',
      daily_tasks: 'Daily Tasks',
    };
    return labels[persona] || 'Daily Tasks';
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      finance: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
      career: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
      daily_task: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-300' },
    };
    return colors[category] || colors.daily_task;
  };

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar - Chat History */}
      <div
        className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 ease-in-out overflow-hidden`}
      >
        <div className="h-full bg-white/80 backdrop-blur-sm rounded-[2rem] border-2 border-[var(--clay-200)] shadow-lg p-4 flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-[var(--clay-200)]">
            <h3 className="text-lg font-bold text-[var(--charcoal)] flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Chats
            </h3>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="w-7 h-7 bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] hover:from-[var(--clay-600)] hover:to-[var(--clay-700)] text-white rounded-lg shadow-md flex items-center justify-center transition-all hover:shadow-lg active:scale-95"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full text-[var(--charcoal)]/60">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-center text-sm text-[var(--charcoal)]/60 py-8">
                No chat history yet.
                <br />
                Start a conversation!
              </div>
            ) : (
              chatHistory.map((item) => {
                const colors = getCategoryColor(item.category);
                const isActive = viewingHistoryId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleViewHistory(item)}
                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-[var(--clay-100)] border-[var(--clay-500)] shadow-md'
                        : 'bg-white border-[var(--clay-200)] hover:border-[var(--clay-400)] hover:shadow-md'
                    }`}
                  >
                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{getPersonaIcon(item.category)}</span>
                      <span className={`px-2 py-0.5 ${colors.bg} ${colors.text} text-xs font-bold rounded-md`}>
                        {getPersonaLabel(item.category)}
                      </span>
                      <span className="text-xs text-[var(--charcoal)]/50 ml-auto">
                        {formatTimeAgo(item.created_at)}
                      </span>
                    </div>

                    {/* Message Preview */}
                    <p className={`text-sm line-clamp-2 transition-colors ${
                      isActive
                        ? 'text-[var(--charcoal)] font-medium'
                        : 'text-[var(--charcoal)] group-hover:text-[var(--clay-600)]'
                    }`}>
                      {item.message}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-white/80 backdrop-blur-sm rounded-[2rem] border-2 border-[var(--clay-200)] shadow-xl hover:shadow-2xl transition-all duration-300">
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-[var(--clay-200)]">
        <div className="flex items-center gap-3 mb-3">
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="w-10 h-10 bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] hover:from-[var(--clay-600)] hover:to-[var(--clay-700)] text-white rounded-lg shadow-md flex items-center justify-center transition-all hover:shadow-lg active:scale-95"
              aria-label="Open chat history"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={3} />
            </button>
          )}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md">
            <MessageCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-[var(--charcoal)]" style={{fontFamily: 'var(--font-fraunces)'}}>
              Chat with Navia
            </h2>
            <p className="text-sm text-[var(--charcoal)]/60">Your AI executive function coach</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[var(--charcoal)]/70 font-medium">
            {viewingHistoryId ? 'Viewing:' : 'Current mode:'}
          </span>
          <span className="px-3 py-1.5 bg-gradient-to-r from-[var(--clay-100)] to-[var(--clay-200)] text-[var(--clay-700)] rounded-full text-sm font-semibold border border-[var(--clay-300)]">
            {getPersonaLabel(currentPersona)}
          </span>
          {viewingHistoryId && (
            <span className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold border border-amber-300">
              📜 History
            </span>
          )}
        </div>
      </div>

      {/* Back to Current Chat Banner */}
      {viewingHistoryId && (
        <div className="px-6 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-amber-800 font-medium">
                📜 You're viewing a past conversation
              </span>
            </div>
            <button
              onClick={handleBackToCurrentChat}
              className="px-4 py-2 bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] hover:from-[var(--clay-600)] hover:to-[var(--clay-700)] text-white rounded-lg font-bold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={3} />
              Back to Current Chat
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            {message.role === 'user' ? (
              /* User Message - Bubble on Right */
              <div className="flex justify-end">
                <div className="max-w-[75%] bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] text-white rounded-3xl px-6 py-4 shadow-lg">
                  <p className="whitespace-pre-wrap leading-relaxed text-[16px] font-medium">{message.content}</p>
                </div>
              </div>
            ) : (
              /* AI Message - No Bubble, Plain Text on Left */
              <div className="flex flex-col max-w-[90%]">
                {/* Persona Badge */}
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-500)] flex items-center justify-center shadow-md">
                    <span className="text-base">{message.personaIcon}</span>
                  </div>
                  <span className="text-xs font-bold text-[var(--charcoal)]/70 uppercase tracking-wider">
                    {getPersonaLabel(message.persona || 'daily_tasks')}
                  </span>
                </div>
                
                {/* Message Content - No Bubble */}
                <div className="text-[var(--charcoal)] space-y-4">
                  <p className="whitespace-pre-wrap text-[16px] leading-[1.7] font-normal">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-1.5 h-5 ml-1 bg-[var(--clay-500)] animate-pulse rounded-sm"></span>
                    )}
                  </p>

                  {/* Feedback Section - Enhanced for Neurodivergent Accessibility */}
                  {message.messageId && !message.isStreaming && (
                    <div className="mt-6 pt-4 border-t-2 border-[var(--clay-200)]">
                      <p className="text-sm font-semibold text-[var(--charcoal)]/70 mb-3">
                        Was this response helpful?
                      </p>
                      
                      <div className="flex items-center gap-3">
                        {/* Thumbs Up Button */}
                        <button
                          onClick={() => handleFeedback(message.messageId!, true)}
                          disabled={message.feedbackLocked}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                            transition-all duration-200 shadow-sm
                            ${message.feedbackLocked 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:scale-105 hover:shadow-md active:scale-95'
                            }
                            ${message.userFeedback === true
                              ? 'bg-green-500 text-white border-2 border-green-600 shadow-lg scale-105'
                              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-green-400 hover:text-green-600 hover:bg-green-50'
                            }
                          `}
                          aria-label="Mark as helpful"
                        >
                          <ThumbsUp className="w-4 h-4" strokeWidth={2.5} />
                          <span>Helpful</span>
                        </button>
                        
                        {/* Thumbs Down Button */}
                        <button
                          onClick={() => handleFeedback(message.messageId!, false)}
                          disabled={message.feedbackLocked}
                          className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm
                            transition-all duration-200 shadow-sm
                            ${message.feedbackLocked 
                              ? 'opacity-50 cursor-not-allowed' 
                              : 'hover:scale-105 hover:shadow-md active:scale-95'
                            }
                            ${message.userFeedback === false
                              ? 'bg-red-500 text-white border-2 border-red-600 shadow-lg scale-105'
                              : 'bg-white text-gray-600 border-2 border-gray-300 hover:border-red-400 hover:text-red-600 hover:bg-red-50'
                            }
                          `}
                          aria-label="Mark as not helpful"
                        >
                          <ThumbsDown className="w-4 h-4" strokeWidth={2.5} />
                          <span>Not Helpful</span>
                        </button>

                        {/* Feedback Status Indicator */}
                        {message.feedbackLocked ? (
                          <div className="flex items-center gap-2 ml-2 px-3 py-2 bg-amber-100 border-2 border-amber-300 rounded-lg">
                            <Lock className="w-4 h-4 text-amber-700" strokeWidth={2.5} />
                            <span className="text-xs font-bold text-amber-700">Feedback Saved</span>
                          </div>
                        ) : message.userFeedback !== null && (
                          <div className="flex items-center gap-1 ml-2 text-xs text-[var(--charcoal)]/60 font-medium">
                            <span>
                              {(() => {
                                const currentState = messageFeedback[message.messageId!] || { toggleCount: 0 };
                                const remaining = 2 - currentState.toggleCount;
                                return remaining === 1 ? '1 change left' : 'Can still change';
                              })()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              
              
                  {/* Breakdown suggestion buttons - Enhanced for Accessibility */}
                  {message.suggestBreakdown && !message.breakdown && (
                    <div className="mt-6 p-5 bg-[var(--clay-50)] rounded-2xl border-2 border-[var(--clay-300)]">
                      <p className="text-base font-semibold mb-4 text-[var(--charcoal)] leading-relaxed">
                        💡 Would you like me to break this down into step-by-step actions?
                      </p>
                      <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => handleBreakdownResponse(true, message.originalQuery || '')}
                          className="flex-1 min-w-[140px] px-5 py-3.5 bg-gradient-to-br from-[var(--sage-500)] to-[var(--sage-600)] hover:from-[var(--sage-600)] hover:to-[var(--sage-700)] text-white rounded-xl font-bold transition-all duration-200 text-sm shadow-md hover:shadow-lg active:scale-95"
                    >
                      🏠 Yes, create a plan
                    </button>
                    <button
                      onClick={() => handleBreakdownResponse(false, message.originalQuery || '')}
                          className="flex-1 min-w-[140px] px-5 py-3.5 bg-white hover:bg-[var(--stone)] text-[var(--charcoal)] rounded-xl font-bold transition-all duration-200 text-sm border-2 border-[var(--clay-300)] hover:border-[var(--clay-400)] shadow-sm active:scale-95"
                    >
                      No, thanks
                    </button>
                  </div>
                </div>
              )}
              
                  {/* Breakdown steps - Enhanced for Clarity */}
              {message.breakdown && message.breakdown.length > 0 && (
                    <div className="mt-6 p-5 bg-[var(--clay-50)] rounded-2xl border-2 border-[var(--clay-300)]">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] flex items-center justify-center shadow-md">
                          <span className="text-lg">📋</span>
                        </div>
                        <p className="text-base font-bold text-[var(--charcoal)]">
                          Your Step-by-Step Plan ({message.breakdown.length} main steps)
                        </p>
                      </div>
                      <div className="space-y-4">
                        {message.breakdown.map((step: any, index: number) => {
                          // Handle both old format (string) and new format (object)
                          const isOldFormat = typeof step === 'string';
                          const title = isOldFormat ? step : step.title;
                          const timeEstimate = !isOldFormat ? step.timeEstimate : null;
                          const subSteps = !isOldFormat ? step.subSteps : null;
                          const isOptional = !isOldFormat ? step.isOptional : false;
                          const isHard = !isOldFormat ? step.isHard : false;

                          return (
                            <div 
                              key={index} 
                              className={`p-4 bg-white rounded-xl border-2 ${
                                isOptional ? 'border-[var(--sage-300)]' : 'border-[var(--clay-300)]'
                              } hover:border-[var(--clay-500)] transition-all`}
                            >
                              {/* Main Step Header */}
                              <div className="flex items-start gap-3 mb-2">
                                <span className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                  isOptional ? 'bg-[var(--sage-500)]' : 'bg-[var(--clay-500)]'
                                } text-white font-bold text-sm flex-shrink-0`}>
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-[var(--charcoal)] text-base leading-snug">
                                      {title}
                                    </span>
                                    {isOptional && (
                                      <span className="px-2 py-0.5 bg-[var(--sage-200)] text-[var(--sage-700)] text-xs font-bold rounded-md">
                                        OPTIONAL
                                      </span>
                                    )}
                                    {isHard && (
                                      <span className="px-2 py-0.5 bg-[var(--clay-200)] text-[var(--clay-700)] text-xs font-bold rounded-md">
                                        ⚠️ CHALLENGING
                                      </span>
                                    )}
                                    {timeEstimate && (
                                      <span className="text-xs text-[var(--charcoal)]/60 font-medium">
                                        ⏱ {timeEstimate}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Sub-steps (if any) */}
                              {subSteps && subSteps.length > 0 && (
                                <ul className="ml-11 mt-3 space-y-2">
                                  {subSteps.map((subStep: string, subIndex: number) => (
                                    <li key={subIndex} className="flex items-start gap-2 text-sm text-[var(--charcoal)]/80 leading-relaxed">
                                      <span className="text-[var(--clay-500)] mt-0.5">•</span>
                                      <span className="flex-1">{subStep}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Breakdown Tips (if any) */}
                      {(message as any).breakdownTips && (message as any).breakdownTips.length > 0 && (
                        <div className="mt-4 p-4 bg-[var(--sage-50)] rounded-xl border border-[var(--sage-300)]">
                          <p className="text-sm font-bold text-[var(--charcoal)] mb-2 flex items-center gap-2">
                            <span>💡</span>
                            <span>Helpful Tips</span>
                          </p>
                          <ul className="space-y-1.5">
                            {(message as any).breakdownTips.map((tip: string, tipIndex: number) => (
                              <li key={tipIndex} className="text-sm text-[var(--charcoal)]/80 leading-relaxed flex items-start gap-2">
                                <span className="text-[var(--sage-600)] mt-0.5">→</span>
                                <span className="flex-1">{tip}</span>
                      </li>
                    ))}
                          </ul>
                        </div>
                      )}
                </div>
              )}
              
                  {/* Sources/Resources - ChatGPT/Claude Style - Horizontal Layout */}
                  {(() => {
                    // Filter valid resources and sources
                    const validResources = message.resources?.filter(r => r.title && r.title.trim() && r.url && r.url.trim()) || [];
                    const validSources = message.sources?.filter(s => s.title && s.title.trim() && s.url && s.url.trim()) || [];
                    const totalSources = validResources.length + validSources.length;
                    
                    if (totalSources === 0) return null;
                    
                    return (
                      <div className="mt-6">
                        <button
                          onClick={() => setExpandedSources(prev => ({ ...prev, [message.id]: !prev[message.id] }))}
                          className="inline-flex items-center gap-3 px-4 py-3 bg-[var(--sand)] hover:bg-[var(--stone)] border-2 border-[var(--clay-300)] hover:border-[var(--clay-400)] rounded-xl transition-all duration-200 shadow-sm hover:shadow-md group"
                        >
                          <div className="flex items-center justify-center w-8 h-8 bg-[var(--clay-500)] rounded-lg">
                            {expandedSources[message.id] ? (
                              <ChevronUp className="w-5 h-5 text-white" strokeWidth={3} />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-white" strokeWidth={3} />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[var(--charcoal)]">
                              {totalSources}
                            </span>
                            <span className="text-sm font-semibold text-[var(--charcoal)]/80">
                              {totalSources === 1 ? 'Source' : 'Sources'}
                            </span>
                          </div>
                          <span className="text-xs text-[var(--charcoal)]/60 font-medium ml-1">
                            {expandedSources[message.id] ? 'Hide' : 'Show'}
                          </span>
                        </button>
                        
                        {expandedSources[message.id] && (
                          <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
                            {validResources.map((resource, index) => (
                              <a
                                key={`resource-${index}`}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                                className="flex-shrink-0 w-72 p-4 bg-white hover:bg-[var(--sand)] rounded-2xl border-2 border-[var(--clay-300)] hover:border-[var(--clay-500)] transition-all hover:shadow-lg active:scale-[0.98] group"
                      >
                                <div className="flex items-start gap-3 mb-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-[var(--clay-500)] flex items-center justify-center flex-shrink-0">
                                    <ExternalLink className="w-4 h-4 text-white" strokeWidth={2.5} />
                                  </div>
                                  <p className="text-sm font-bold text-[var(--charcoal)] group-hover:text-[var(--clay-600)] line-clamp-2 leading-snug">
                        {resource.title}
                                  </p>
                                </div>
                                {resource.description && (
                                  <p className="text-sm text-[var(--charcoal)]/70 line-clamp-2 leading-relaxed ml-11">
                                    {resource.description}
                                  </p>
                                )}
                              </a>
                            ))}
                            {validSources.map((source, index) => (
                              <a
                                key={`source-${index}`}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 w-72 p-4 bg-white hover:bg-[var(--sand)] rounded-2xl border-2 border-[var(--clay-300)] hover:border-[var(--clay-500)] transition-all hover:shadow-lg active:scale-[0.98] group"
                              >
                                <div className="flex items-start gap-3 mb-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-[var(--clay-500)] flex items-center justify-center flex-shrink-0">
                                    <ExternalLink className="w-4 h-4 text-white" strokeWidth={2.5} />
                                  </div>
                                  <p className="text-sm font-bold text-[var(--charcoal)] group-hover:text-[var(--clay-600)] line-clamp-2 leading-snug">
                                    {source.title}
                                  </p>
                                </div>
                                {source.excerpt && (
                                  <p className="text-sm text-[var(--charcoal)]/70 line-clamp-2 leading-relaxed ml-11">
                                    {source.excerpt}
                                  </p>
                                )}
                      </a>
                    ))}
                  </div>
                        )}
                </div>
                    );
                  })()}
              
              {/* Function call result */}
              {message.functionCall && (
                    <div className="mt-5 p-3 bg-[var(--sage-100)]/50 rounded-lg border border-[var(--sage-300)]">
                      <p className="text-xs font-semibold mb-1.5 text-[var(--charcoal)]">
                    {message.functionCall.name === 'break_down_task' && '📋 Task Breakdown Created'}
                    {message.functionCall.name === 'get_references' && '📚 Resources Found'}
                  </p>
                  {message.functionCall.result?.link && (
                    <a
                      href={message.functionCall.result.link}
                          className="text-xs text-[var(--clay-600)] hover:text-[var(--clay-700)] font-medium hover:underline underline-offset-2 transition-colors"
                    >
                      View in Task Visualizer →
                    </a>
                  )}
                </div>
              )}
                </div>
            </div>
            )}
          </div>
        ))}
        
        {/* Modern Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col max-w-[90%]">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[var(--clay-400)] to-[var(--clay-500)] flex items-center justify-center shadow-sm">
                <MessageCircle className="w-4 h-4 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-semibold text-[var(--charcoal)]/60 uppercase tracking-wider">
                Navia
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }}></div>
                <div className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }}></div>
                <div className="w-2 h-2 bg-[var(--clay-400)] rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Enhanced for Accessibility */}
      <div className="px-6 py-6 border-t-2 border-[var(--clay-200)] bg-[var(--sand)]/30">
        {viewingHistoryId ? (
          <div className="flex items-center justify-center gap-3 px-5 py-4 bg-amber-50 border-2 border-amber-200 rounded-2xl">
            <span className="text-sm text-amber-800 font-medium">
              📜 Return to current chat to send messages
            </span>
            <button
              onClick={handleBackToCurrentChat}
              className="px-4 py-2 bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] hover:from-[var(--clay-600)] hover:to-[var(--clay-700)] text-white rounded-lg font-bold text-xs transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              Back to Current Chat
            </button>
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                placeholder="Type your message here..."
                className="flex-1 px-5 py-4 text-base border-2 border-[var(--clay-300)] rounded-2xl focus:ring-4 focus:ring-[var(--clay-400)]/30 focus:border-[var(--clay-500)] text-[var(--charcoal)] placeholder:text-[var(--charcoal)]/50 transition-all duration-200 bg-white font-medium shadow-sm"
                disabled={isLoading}
                aria-label="Message input"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="px-7 py-4 bg-gradient-to-br from-[var(--clay-500)] to-[var(--clay-600)] hover:from-[var(--clay-600)] hover:to-[var(--clay-700)] text-white rounded-2xl font-bold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2 min-w-[100px]"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-sm">Send</span>
              </button>
            </div>
            <p className="text-xs text-[var(--charcoal)]/60 mt-3 font-medium">
              💡 Tip: Press Enter to send your message
            </p>
          </>
        )}
      </div>
    </div>
    </div>
  );
}
