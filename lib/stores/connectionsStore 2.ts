import { create } from 'zustand';

interface Connection {
  id: string;
  peer_id: string;
  peer_name: string;
  peer_bio: string;
  neurotype: string[];
  shared_struggles: string[];
  status: 'pending' | 'active' | 'paused' | 'ended';
  created_at: string;
  last_checkin?: string;
  initiated_by?: string;
}

interface ConnectionsState {
  connections: Connection[];
  isLoading: boolean;
  error?: string;
  currentUserId: string | null;
  showSuccessDialog: boolean;
  successMessage: string;
  fetchConnections: () => Promise<void>;
  acceptConnection: (connectionId: string) => Promise<boolean>;
  declineConnection: (connectionId: string) => Promise<boolean>;
  setCurrentUserId: (userId: string) => void;
  setShowSuccessDialog: (show: boolean) => void;
}

export const useConnectionsStore = create<ConnectionsState>((set, get) => ({
  connections: [],
  isLoading: true,
  error: undefined,
  currentUserId: null,
  showSuccessDialog: false,
  successMessage: '',

  setCurrentUserId: (userId: string) => set({ currentUserId: userId }),

  setShowSuccessDialog: (show: boolean) => set({ showSuccessDialog: show }),

  fetchConnections: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const response = await fetch('/api/peers/connections');
      const data = await response.json();
      
      if (data.connections) {
        set({ connections: data.connections, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch connections',
        isLoading: false 
      });
    }
  },

  acceptConnection: async (connectionId: string) => {
    try {
      const response = await fetch('/api/peers/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state immediately
        set(state => ({
          connections: state.connections.map(conn =>
            conn.id === connectionId ? { ...conn, status: 'active' as const } : conn
          ),
          showSuccessDialog: true,
          successMessage: 'Connection accepted! You can now message each other.',
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error accepting connection:', error);
      return false;
    }
  },

  declineConnection: async (connectionId: string) => {
    try {
      const response = await fetch('/api/peers/decline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectionId }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove from local state immediately
        set(state => ({
          connections: state.connections.filter(conn => conn.id !== connectionId),
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error declining connection:', error);
      return false;
    }
  },
}));
