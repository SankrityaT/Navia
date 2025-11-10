// FRONTEND: Multi-Tab Chat Interface with Session Management
// Supports multiple concurrent chat sessions like a browser

'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageCircle, ChevronDown, ChevronUp, ExternalLink, ChevronLeft, ChevronRight, Clock, Plus, X, Menu, ThumbsUp, ThumbsDown } from 'lucide-react';

// ============================================
// TYPES & INTERFACES
// ============================================

interface BreakdownStep {
  title: string;
  timeEstimate?: string;
  subSteps?: string[];
  isOptional?: boolean;
  isHard?: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  persona?: string;
  personaIcon?: string;
  timestamp: Date;
  functionCall?: any;
  breakdown?: (string | BreakdownStep)[]; // Support both old (string) and new (object) formats
  resources?: Array<{ title: string; url: string; description?: string; type?: string }>;
  sources?: Array<{ title: string; url: string; excerpt?: string }>;
  suggestBreakdown?: boolean;
  originalQuery?: string;
  isStreaming?: boolean;
  supabaseMessageId?: string; // Supabase UUID for feedback tracking
  userFeedback?: boolean | null; // true = helpful, false = not helpful, null = no feedback
  feedbackLocked?: boolean; // Whether feedback is locked after 2 toggles
}

interface ChatTab {
  id: string; // Unique tab ID
  sessionId: string; // Session ID for backend
  sessionTitle: string; // Display title
  messages: Message[];
  isHistorical: boolean; // True if loaded from history (read-only)
  category: 'finance' | 'career' | 'daily_task';
  createdAt: number;
  lastActiveAt: number;
}

interface ChatSession {
  session_id: string;
  session_title: string;
  message_count: number;
  last_message_at: string;
  category: 'finance' | 'career' | 'daily_task';
  first_message: string;
}

interface ChatInterfaceProps {
  userContext?: {
    ef_profile?: string[];
    current_goals?: string[];
    energy_level?: number;
  };
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ChatInterface({ userContext }: ChatInterfaceProps) {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // Multi-tab state
  const [tabs, setTabs] = useState<ChatTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');
  
  // UI state
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [expandedResources, setExpandedResources] = useState<Record<string, boolean>>({});
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const STORAGE_KEY = 'navia_multi_tabs';
  const SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  const MAX_TABS = 10;

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateTabId = () => `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const getActiveTab = (): ChatTab | undefined => {
    return tabs.find(tab => tab.id === activeTabId);
  };

  // ============================================
  // TAB MANAGEMENT
  // ============================================

  const createNewTab = () => {
    if (tabs.length >= MAX_TABS) {
      console.warn(`⚠️ Maximum ${MAX_TABS} tabs reached. Please close some tabs first.`);
      // Silently fail - button should be disabled anyway when at max tabs
      return;
    }

    const newTab: ChatTab = {
      id: generateTabId(),
      sessionId: generateSessionId(),
      sessionTitle: 'New Chat',
      messages: [{
        id: '1',
        role: 'assistant',
        content: "Hi! I'm Navia, your AI executive function coach. 💚\n\nI'm here to support you with career planning, managing finances, organizing daily tasks, and more—without any masking required. Just tell me what's on your mind, and we'll figure it out together.",
        persona: 'daily_tasks',
        personaIcon: '✅',
        timestamp: new Date(),
      }],
      isHistorical: false,
      category: 'daily_task',
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    saveTabsToStorage([...tabs, newTab]);
  };

  const loadSessionTab = async (session: ChatSession) => {
    // Check if session already open
    const existingTab = tabs.find(tab => tab.sessionId === session.session_id);
    if (existingTab) {
      setActiveTabId(existingTab.id);
      return;
    }

    if (tabs.length >= MAX_TABS) {
      console.warn(`⚠️ Maximum ${MAX_TABS} tabs reached. Please close some tabs first.`);
      // Silently fail - user can see they're at max tabs
      return;
    }

    try {
      console.log('🔄 Loading session:', session.session_id);
      
      // Fetch session messages from backend
      const response = await fetch(`/api/chat/sessions/${session.session_id}`);
      
      console.log('📡 Session API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error:', response.status, errorText);
        throw new Error(`Failed to load session: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Session data loaded:', data);
      
      if (!data.messages || data.messages.length === 0) {
        throw new Error('Session has no messages');
      }
      
      // Convert to Message format
      const messages: Message[] = data.messages.map((msg: any, idx: number) => {
        const toggleCount = msg.metadata?.feedbackToggleCount || 0;
        const isLocked = toggleCount >= 2;
        
        return [
          {
            id: `${session.session_id}_${idx * 2}`,
            role: 'user' as const,
            content: msg.message,
            timestamp: new Date(msg.created_at),
          },
          {
            id: `${session.session_id}_${idx * 2 + 1}`,
            role: 'assistant' as const,
            content: msg.response,
            persona: msg.category,
            personaIcon: getCategoryIcon(msg.category),
            timestamp: new Date(msg.created_at),
            supabaseMessageId: msg.id,
            userFeedback: msg.user_feedback ?? null,
            feedbackLocked: isLocked,
          }
        ];
      }).flat();

      console.log('💬 Converted messages:', messages.length);

      const newTab: ChatTab = {
        id: generateTabId(),
        sessionId: session.session_id,
        sessionTitle: stripEmojisFromTitle(session.session_title), // Strip emoji from old titles
        messages,
        isHistorical: false, // Allow continuation - NOT read-only!
        category: session.category,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };

      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
      saveTabsToStorage([...tabs, newTab]);
      
      console.log('✅ Session tab opened successfully (editable)');
    } catch (error) {
      console.error('❌ Error loading session:', error);
      
      // Create a new tab with error message instead of popup
      const errorTab: ChatTab = {
        id: generateTabId(),
        sessionId: session.session_id,
        sessionTitle: session.session_title,
        messages: [{
          id: '1',
          role: 'assistant',
          content: `⚠️ I had trouble loading this conversation. This might be due to:\n\n• Network connectivity issues\n• The session may have been deleted\n• Server temporarily unavailable\n\nWould you like to start a new conversation instead?`,
          persona: 'orchestrator',
          timestamp: new Date(),
        }],
        isHistorical: false,
        category: session.category,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
      };

      setTabs(prev => [...prev, errorTab]);
      setActiveTabId(errorTab.id);
    }
  };

  const closeTab = (tabId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    const newTabs = tabs.filter(t => t.id !== tabId);
    
    // Allow closing last tab - will show empty state
    if (newTabs.length === 0) {
      console.log('🗑️ Closing last tab - showing empty state');
      setTabs([]);
      setActiveTabId('');
      localStorage.removeItem(STORAGE_KEY); // Clear storage when all tabs closed
      return;
    }

    setTabs(newTabs);

    // Switch to adjacent tab if closing active
    if (activeTabId === tabId) {
      const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 0;
      setActiveTabId(newTabs[newActiveIndex]?.id || '');
    }

    saveTabsToStorage(newTabs);
  };

  const switchTab = (tabId: string) => {
    setActiveTabId(tabId);
    setTabs(prev => prev.map(tab => 
      tab.id === tabId 
        ? { ...tab, lastActiveAt: Date.now() }
        : tab
    ));
  };

  // ============================================
  // SESSION API CALLS
  // ============================================

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true);
      const response = await fetch('/api/chat/sessions?limit=5');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // ============================================
  // FEEDBACK HANDLING
  // ============================================

  const handleFeedback = async (messageId: string, supabaseMessageId: string | undefined, feedback: boolean) => {
    if (!supabaseMessageId) {
      console.error('❌ Cannot submit feedback: No Supabase message ID');
      return;
    }

    const activeTab = getActiveTab();
    if (!activeTab) return;

    // Get current message state
    const currentMessage = activeTab.messages.find(msg => msg.id === messageId);
    if (!currentMessage) return;

    // Check if locked
    if (currentMessage.feedbackLocked) {
      console.warn('⚠️ Feedback is locked after 2 selections');
      return;
    }

    // Determine new feedback value (toggle if clicking same button, or set new value)
    const currentFeedback = currentMessage.userFeedback;
    const newFeedback = currentFeedback === feedback ? null : feedback;

    try {
      console.log(`📊 Submitting feedback: message_id=${supabaseMessageId}, feedback=${newFeedback === null ? 'null (remove)' : newFeedback ? 'helpful' : 'not helpful'}`);

      // Optimistically update UI
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              messages: tab.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, userFeedback: newFeedback }
                  : msg
              ),
            }
          : tab
      ));

      const response = await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: supabaseMessageId,
          feedback: newFeedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Feedback API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Feedback submitted successfully:', data);

      // Update with server response (includes locked status and toggle count)
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              messages: tab.messages.map(msg =>
                msg.id === messageId
                  ? {
                      ...msg,
                      userFeedback: data.feedback,
                      feedbackLocked: data.locked,
                    }
                  : msg
              ),
            }
          : tab
      ));

      // Show notification if locked
      if (data.locked) {
        console.warn('⚠️ Feedback is now locked after 2 selections');
      }

    } catch (error: any) {
      console.error('❌ Failed to submit feedback:', error);
      
      // Revert optimistic update on error
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              messages: tab.messages.map(msg =>
                msg.id === messageId
                  ? { ...msg, userFeedback: currentFeedback }
                  : msg
              ),
            }
          : tab
      ));

      // Show error message
      if (error.message?.includes('locked')) {
        console.warn('⚠️ Feedback is locked after 2 selections');
      } else {
        console.warn('⚠️ Feedback not saved - network error. Your feedback will not be recorded.');
      }
    }
  };

  // ============================================
  // BREAKDOWN HANDLING
  // ============================================

  const handleRequestBreakdown = async (messageId: string, originalQuery: string) => {
    const activeTab = getActiveTab();
    if (!activeTab || isLoading) return;

    console.log(`📋 Requesting breakdown for message: ${messageId}`);
    
    setIsLoading(true);

    try {
      // Send request for breakdown
      const breakdownQuery = `Please break down the following task into detailed steps: "${originalQuery}"`;
      
      const sessionMessages = activeTab.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log('🚀 Sending breakdown request to API');

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: breakdownQuery,
          userContext,
          sessionMessages,
          session_id: activeTab.sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      console.log('📥 Received breakdown response:', {
        hasBreakdown: !!data.breakdown,
        breakdownLength: data.breakdown?.length,
      });

      // Update the original message with the breakdown
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              messages: tab.messages.map(msg =>
                msg.id === messageId
                  ? {
                      ...msg,
                      breakdown: data.breakdown || [],
                      suggestBreakdown: false, // Hide the button
                    }
                  : msg
              ),
            }
          : tab
      ));

      console.log('✅ Breakdown updated in message');

    } catch (error) {
      console.error('❌ Failed to get breakdown:', error);
      
      // Show inline error message in chat instead of popup
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              messages: [
                ...tab.messages,
                {
                  id: Date.now().toString(),
                  role: 'assistant' as const,
                  content: '⚠️ I had trouble generating the breakdown. This might be due to high server load or connectivity issues. Would you like to try asking again, or would you prefer I answer your question in a different way?',
                  timestamp: new Date(),
                  persona: 'orchestrator',
                }
              ],
            }
          : tab
      ));
    } finally {
      setIsLoading(false);
    }
  };

  // ============================================
  // MESSAGE HANDLING
  // ============================================

  const handleSend = async () => {
    const activeTab = getActiveTab();
    if (!input.trim() || isLoading || !activeTab) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    // Add user message to active tab
    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? { ...tab, messages: [...tab.messages, userMessage] }
        : tab
    ));

    setInput('');
    setIsLoading(true);

    // Add streaming assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    setTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? {
            ...tab,
            messages: [...tab.messages, {
              id: assistantMessageId,
              role: 'assistant' as const,
              content: '',
              isStreaming: true,
              timestamp: new Date(),
            }]
          }
        : tab
    ));

    try {
      // Prepare session messages for context (last 10 from active tab)
      const sessionMessages = activeTab.messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      console.log('🚀 Sending to API:', {
        query: userMessage.content,
        sessionMessagesCount: sessionMessages.length,
        sessionMessages: sessionMessages,
        session_id: activeTab.sessionId,
      });

      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: userMessage.content,
          userContext,
          sessionMessages,
          session_id: activeTab.sessionId, // CRITICAL: Session-level context
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      console.log('📥 Received API response:', {
        success: data.success,
        summary: data.summary?.substring(0, 100),
        hasBreakdown: !!data.breakdown,
        breakdownLength: data.breakdown?.length,
        hasResources: !!data.resources,
        resourcesCount: data.resources?.length,
        hasSources: !!data.sources,
        sourcesCount: data.sources?.length,
        metadata: data.metadata,
      });

      // Handle error responses
      if (!data.success || data.error) {
        throw new Error(data.error || 'API returned error');
      }

      // Filter out "Untitled" sources from RAG
      const filteredSources = (data.sources || []).filter((s: any) => 
        s.title && s.title !== 'Untitled' && s.title.length > 3
      );

      console.log('🔍 Filtered sources:', filteredSources.length, 'out of', (data.sources || []).length);

      // Update assistant message with response
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              sessionTitle: tab.sessionTitle === 'New Chat' 
                ? (data.metadata?.sessionTitle || 'New Chat')
                : tab.sessionTitle,
              messages: tab.messages.map(msg =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: data.summary || data.message || data.response || 'No response received',
                      isStreaming: false,
                      persona: data.metadata?.category,
                      personaIcon: getCategoryIcon(data.metadata?.category),
                      breakdown: data.breakdown,
                      resources: data.resources || [], // Web resources
                      sources: filteredSources, // RAG sources (filtered)
                      suggestBreakdown: data.metadata?.needsBreakdown && !data.breakdown,
                      originalQuery: userMessage.content, // Store original query for breakdown
                      supabaseMessageId: data.metadata?.messageId, // Capture Supabase UUID
                      userFeedback: null, // Initialize feedback as null
                    }
                  : msg
              ),
              lastActiveAt: Date.now(),
            }
          : tab
      ));

      // Refresh sessions sidebar
      fetchSessions();

    } catch (error) {
      console.error('❌ Chat error:', error);
      
      // Update with error message
      setTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              messages: tab.messages.map(msg =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: 'Sorry, I encountered an error. Please try again.',
                      isStreaming: false,
                    }
                  : msg
              ),
            }
          : tab
      ));
    } finally {
      // CRITICAL: Always reset loading state
      setIsLoading(false);
      console.log('✅ Loading complete');
    }
  };

  // ============================================
  // STORAGE PERSISTENCE
  // ============================================

  const saveTabsToStorage = (tabsToSave: ChatTab[]) => {
    try {
      const storageData = {
        tabs: tabsToSave,
        activeTabId: activeTabId,
        timestamp: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
      console.log('✅ Saved to localStorage:', {
        tabCount: tabsToSave.length,
        activeTabId,
        tabTitles: tabsToSave.map(t => t.sessionTitle),
      });
    } catch (error) {
      console.error('❌ Failed to save tabs:', error);
    }
  };

  const loadTabsFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { tabs: storedTabs, activeTabId: storedActiveId, timestamp } = JSON.parse(stored);
        
        // Check expiry (24 hours)
        if (Date.now() - timestamp < SESSION_TIMEOUT) {
          console.log('📂 Loading tabs from localStorage:', storedTabs.length, 'tabs');
          setTabs(storedTabs);
          setActiveTabId(storedActiveId);
          return storedTabs.length; // Return count of loaded tabs
        } else {
          console.log('⏰ localStorage expired, clearing');
        }
      } else {
        console.log('📂 No tabs in localStorage (first visit)');
      }
    } catch (error) {
      console.error('❌ Failed to load tabs:', error);
    }
    return 0; // Return 0 if nothing loaded
  };

  // ============================================
  // LIFECYCLE HOOKS
  // ============================================

  useEffect(() => {
    scrollToBottom();
  }, [tabs, activeTabId]);

  // Initialize on mount: Load tabs from localStorage OR create first tab
  useEffect(() => {
    console.log('🚀 ChatInterface mounting - initializing tabs');
    
    const loadedTabsCount = loadTabsFromStorage();
    
    // Only create new tab if localStorage was empty or expired
    if (loadedTabsCount === 0) {
      console.log('✨ Creating first tab (no saved tabs found)');
      createNewTab();
    }
    
    // Fetch sessions for sidebar
    fetchSessions();
  }, []); // Run only once on mount

  // REMOVED: Safety check for empty tabs
  // Now we allow empty state when user closes all tabs

  // Auto-save tabs when they change
  useEffect(() => {
    if (tabs.length > 0) {
      console.log('💾 Auto-saving tabs to localStorage:', tabs.length, 'tabs');
      saveTabsToStorage(tabs);
    }
  }, [tabs, activeTabId]);

  // ============================================
  // UI HELPER FUNCTIONS
  // ============================================

  const getCategoryIcon = (category: string, isMultiCategory?: boolean) => {
    // If session has multiple categories, show generic chat icon
    if (isMultiCategory) {
      return '💬';
    }
    
    switch (category) {
      case 'finance': return '💰';
      case 'career': return '💼';
      case 'daily_task': return '✅';
      default: return '💬';
    }
  };

  const stripEmojisFromTitle = (title: string): string => {
    // Remove common category emojis from title (for old sessions that have them)
    return title.replace(/^(💰|💼|✅|💬)\s*/, '').trim();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'finance': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'career': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'daily_task': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const toggleSources = (messageId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const toggleResources = (messageId: string) => {
    setExpandedResources(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const activeTab = getActiveTab();

  // ============================================
  // DEBUG: Log state for troubleshooting
  // ============================================
  useEffect(() => {
    console.log('🐛 ChatInterface State:', {
      tabsCount: tabs.length,
      activeTabId,
      hasActiveTab: !!activeTab,
      isLoading,
      activeTabMessages: activeTab?.messages?.length || 0,
      activeTabSessionId: activeTab?.sessionId,
      activeTabIsHistorical: activeTab?.isHistorical,
    });
  }, [tabs, activeTabId, isLoading]);

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="flex h-full bg-[#F5F1E8] rounded-2xl shadow-lg overflow-hidden">
      {/* ============================================ */}
      {/* SIDEBAR: Session History */}
      {/* ============================================ */}
      <div
        className={`${
          isSidebarOpen ? 'w-80' : 'w-0'
        } transition-all duration-300 ease-in-out overflow-hidden border-r border-[#E8E0D0] bg-white flex-shrink-0`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-[#E8E0D0] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#C77A4C]" />
              <h2 className="font-semibold text-gray-800">Recent Sessions</h2>
          </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 hover:bg-[#F5F1E8] rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            </button>
      </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#FAFAF8]">
            {isLoadingSessions ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-[#C77A4C]" />
                </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                No sessions yet. Start chatting!
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.session_id}
                  onClick={() => loadSessionTab(session)}
                  className="w-full p-3 text-left rounded-xl hover:bg-white transition-all duration-200 border border-[#E8E0D0] hover:border-[#C77A4C] hover:shadow-sm group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{getCategoryIcon(session.category)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 text-sm truncate group-hover:text-[#C77A4C] transition-colors">
                        {stripEmojisFromTitle(session.session_title)}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {session.first_message.substring(0, 50)}
                        {session.first_message.length > 50 ? '...' : ''}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(session.category)}`}>
                          {session.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(session.last_message_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
                </div>
                
      {/* ============================================ */}
      {/* MAIN CHAT AREA */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* ============================================ */}
        {/* TAB BAR */}
        {/* ============================================ */}
        <div className="bg-white border-b border-[#E8E0D0] flex items-center gap-2 shadow-sm flex-shrink-0">
          {/* Sidebar Toggle (when closed) */}
          {!isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-3 hover:bg-[#F5F1E8] transition-colors shrink-0"
              title="Show sidebar"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}

          {/* Tabs Container with Horizontal Scroll */}
          <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="flex gap-1 px-2 py-2 min-w-max">
              {tabs.map((tab) => (
                    <button
                  key={tab.id}
                  onClick={() => switchTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTabId === tab.id
                      ? 'bg-[#C77A4C] text-white shadow-sm'
                      : 'bg-[#F5F1E8] text-gray-700 hover:bg-[#E8E0D0]'
                  }`}
                >
                  <span className="text-base">{getCategoryIcon(tab.category)}</span>
                  <span className="text-sm font-medium max-w-[150px] truncate">
                    {stripEmojisFromTitle(tab.sessionTitle)}
                  </span>
                  <X
                    className={`w-4 h-4 shrink-0 ${
                      activeTabId === tab.id
                        ? 'text-white hover:text-red-200'
                        : 'text-gray-400 hover:text-red-600'
                    }`}
                    onClick={(e) => closeTab(tab.id, e)}
                  />
                    </button>
              ))}
            </div>
          </div>

          {/* New Tab Button */}
                    <button
            onClick={createNewTab}
            className="p-3 hover:bg-[#F5F1E8] transition-colors text-[#C77A4C] shrink-0 mr-2"
            title="New chat"
            disabled={tabs.length >= MAX_TABS}
          >
            <Plus className="w-5 h-5" />
                    </button>
                  </div>

        {/* ============================================ */}
        {/* MESSAGES AREA */}
        {/* ============================================ */}
        {activeTab ? (
          <>
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAF8]">
              {activeTab.messages.map((message, index) => (
                            <div 
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-[#C77A4C] text-white shadow-sm'
                        : 'bg-white shadow-sm border border-[#E8E0D0]'
                    }`}
                  >
                    {/* Category badge removed - icon is already in tab header */}
                    
                    <div className={`whitespace-pre-wrap ${message.role === 'user' ? 'text-white' : 'text-gray-800'}`}>
                      {message.isStreaming ? (
                        <span className="inline-flex items-center gap-1">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Thinking...
                        </span>
                      ) : (
                        message.content
                      )}
                    </div>

                    {/* Suggest Breakdown Button - MOVED TO TOP */}
                    {message.role === 'assistant' && message.suggestBreakdown && !message.breakdown && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button 
                          onClick={() => handleRequestBreakdown(message.id, message.originalQuery || '')}
                          disabled={isLoading}
                          className="px-4 py-2 bg-[#C77A4C] text-white rounded-lg hover:bg-[#B36A3C] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Generating breakdown...
                            </>
                          ) : (
                            <>
                              <span>📋</span>
                              Break this down into steps
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Breakdown */}
                    {message.breakdown && message.breakdown.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="font-semibold text-sm text-gray-700 mb-2">
                          📋 Task Breakdown:
                        </div>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                          {message.breakdown.map((step, idx) => {
                            // Handle both string format (old) and object format (new)
                            if (typeof step === 'string') {
                              return <li key={idx}>{step}</li>;
                            } else if (step && typeof step === 'object' && 'title' in step) {
                              // New format with title, timeEstimate, etc.
                              const breakdownStep = step as BreakdownStep;
                              return (
                                <li key={idx} className="mb-2">
                                  <div className="font-medium text-gray-800">{breakdownStep.title}</div>
                                  {breakdownStep.timeEstimate && (
                                    <span className="text-xs text-gray-500 ml-1">({breakdownStep.timeEstimate})</span>
                                  )}
                                  {breakdownStep.subSteps && breakdownStep.subSteps.length > 0 && (
                                    <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-xs text-gray-500">
                                      {breakdownStep.subSteps.map((subStep, subIdx) => (
                                        <li key={subIdx}>{subStep}</li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              );
                            }
                            return null;
                          })}
                        </ol>
                      </div>
                    )}

                    {/* Resources (Web Search Results) - NOW COLLAPSIBLE CARDS */}
                    {message.resources && message.resources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => toggleResources(message.id)}
                          className="flex items-center gap-3 px-4 py-2 bg-[#C77A4C] text-white rounded-lg hover:bg-[#B36A3C] transition-colors text-sm font-medium"
                        >
                          {expandedResources[message.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          {message.resources.length} Resources
                          <span className="ml-auto text-xs opacity-90">
                            {expandedResources[message.id] ? 'Hide' : 'Show'}
                          </span>
                        </button>
                        {expandedResources[message.id] && (
                          <div className="mt-4 overflow-x-auto">
                            <div className="flex gap-3 pb-2">
                              {message.resources.map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 w-64 p-4 border border-gray-200 rounded-xl hover:border-[#C77A4C] hover:shadow-md transition-all bg-white group"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-[#F5F1E8] rounded-lg shrink-0">
                                      <ExternalLink className="w-5 h-5 text-[#C77A4C]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-sm text-gray-900 mb-2 group-hover:text-[#C77A4C] transition-colors line-clamp-2">
                                        {resource.title}
                                      </div>
                                      {resource.description && (
                                        <p className="text-xs text-gray-600 line-clamp-3">{resource.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sources (RAG Results) - COLLAPSIBLE CARDS */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => toggleSources(message.id)}
                          className="flex items-center gap-3 px-4 py-2 bg-[#C77A4C] text-white rounded-lg hover:bg-[#B36A3C] transition-colors text-sm font-medium"
                        >
                          {expandedSources[message.id] ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                          {message.sources.length} Sources
                          <span className="ml-auto text-xs opacity-90">
                            {expandedSources[message.id] ? 'Hide' : 'Show'}
                          </span>
                        </button>
                        {expandedSources[message.id] && (
                          <div className="mt-4 overflow-x-auto">
                            <div className="flex gap-3 pb-2">
                              {message.sources.map((source, idx) => (
                                <a
                                  key={idx}
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-shrink-0 w-64 p-4 border border-gray-200 rounded-xl hover:border-[#C77A4C] hover:shadow-md transition-all bg-white group"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-[#F5F1E8] rounded-lg shrink-0">
                                      <ExternalLink className="w-5 h-5 text-[#C77A4C]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-semibold text-sm text-gray-900 mb-2 group-hover:text-[#C77A4C] transition-colors line-clamp-2">
                                        {source.title}
                                      </div>
                                      {source.excerpt && (
                                        <p className="text-xs text-gray-600 line-clamp-3">{source.excerpt}</p>
                                      )}
                                    </div>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Was this response helpful? - MOVED TO BOTTOM */}
                    {message.role === 'assistant' && !message.isStreaming && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-600 mb-3">
                          Was this response helpful?
                          {message.feedbackLocked && (
                            <span className="ml-2 text-xs text-gray-500">(Locked after 2 selections)</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleFeedback(message.id, message.supabaseMessageId, true)}
                            disabled={message.feedbackLocked}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
                              message.userFeedback === true
                                ? 'bg-green-50 border-green-500 text-green-700'
                                : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            <ThumbsUp className="w-4 h-4" />
                            Helpful
                          </button>
                          <button 
                            onClick={() => handleFeedback(message.id, message.supabaseMessageId, false)}
                            disabled={message.feedbackLocked}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors text-sm ${
                              message.userFeedback === false
                                ? 'bg-red-50 border-red-500 text-red-700'
                                : 'border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                          >
                            <ThumbsDown className="w-4 h-4" />
                            Not Helpful
                          </button>
                        </div>
                      </div>
                    )}
                </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-[#E8E0D0] bg-white p-4 shadow-sm flex-shrink-0">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Ask me anything..."
            disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-[#E8E0D0] rounded-xl focus:ring-2 focus:ring-[#C77A4C] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-[#FAFAF8]"
          />
          <button
                  onClick={handleSend}
            disabled={isLoading || !input.trim()}
                  className="px-6 py-3 bg-[#C77A4C] text-white rounded-xl hover:bg-[#B36A3C] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          // EMPTY STATE: No tabs open
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#FAFAF8] to-[#F5F1E8] overflow-hidden">
            <div className="max-w-2xl mx-auto text-center p-8">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto bg-[#C77A4C]/10 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-12 h-12 text-[#C77A4C]" />
                </div>
              </div>

              {/* Message */}
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                Welcome to Navia! 👋
              </h2>
              <p className="text-gray-600 mb-8">
                Your AI executive function coach is here to help with career planning, managing finances, and organizing daily tasks.
              </p>

              {/* New Chat Button */}
              <button
                onClick={createNewTab}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#C77A4C] text-white rounded-xl hover:bg-[#B36A3C] transition-colors shadow-sm text-base font-medium mb-8"
              >
                <Plus className="w-5 h-5" />
                Start New Chat
              </button>

              {/* Recent Sessions */}
              {sessions.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-4">Or continue from recent sessions:</p>
                  <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                    {sessions.slice(0, 3).map((session) => (
                      <button
                        key={session.session_id}
                        onClick={() => loadSessionTab(session)}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-[#C77A4C] hover:shadow-sm transition-all text-left"
                      >
                        <span className="text-2xl">{getCategoryIcon(session.category)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-800 truncate">
                            {stripEmojisFromTitle(session.session_title)}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {session.first_message.substring(0, 40)}...
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
