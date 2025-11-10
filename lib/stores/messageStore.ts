import { create } from 'zustand';
import { PeerMessage } from '@/lib/types';

interface MessageState {
  messages: Record<string, PeerMessage[]>;
  isLoading: Record<string, boolean>;
  lastFetched: Record<string, number>;
  setMessages: (connectionId: string, messages: PeerMessage[]) => void;
  addMessage: (connectionId: string, message: PeerMessage) => void;
  setLoading: (connectionId: string, loading: boolean) => void;
  updateLastFetched: (connectionId: string) => void;
  shouldFetch: (connectionId: string) => boolean;
  clearMessages: (connectionId: string) => void;
  markAsRead: (connectionId: string, messageId: string) => void;
}

const FETCH_COOLDOWN_MS = 3000; // Only fetch once every 3 seconds

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: {},
  isLoading: {},
  lastFetched: {},
  
  setMessages: (connectionId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [connectionId]: messages,
      },
    })),
  
  addMessage: (connectionId, message) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [connectionId]: [...(state.messages[connectionId] || []), message],
      },
    })),
  
  setLoading: (connectionId, loading) =>
    set((state) => ({
      isLoading: {
        ...state.isLoading,
        [connectionId]: loading,
      },
    })),
  
  updateLastFetched: (connectionId) =>
    set((state) => ({
      lastFetched: {
        ...state.lastFetched,
        [connectionId]: Date.now(),
      },
    })),
  
  shouldFetch: (connectionId) => {
    const lastFetch = get().lastFetched[connectionId];
    if (!lastFetch) return true;
    return Date.now() - lastFetch > FETCH_COOLDOWN_MS;
  },
  
  clearMessages: (connectionId) =>
    set((state) => {
      const newMessages = { ...state.messages };
      delete newMessages[connectionId];
      return { messages: newMessages };
    }),
  
  markAsRead: (connectionId, messageId) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [connectionId]: state.messages[connectionId]?.map((msg) =>
          msg.message_id === messageId ? { ...msg, read: true } : msg
        ) || [],
      },
    })),
}));
