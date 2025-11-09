import { create, type StateCreator } from 'zustand';
import { PeerMatch } from '@/lib/types';

export interface PeersState {
  matches: PeerMatch[];
  hasProfile: boolean;
  isLoading: boolean;
  error?: string;
  lastUpdated?: number;
  fetchMatches: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

const POLL_INTERVAL_MS = 15000;

let pollingTimer: ReturnType<typeof setInterval> | null = null;

const peersStateCreator: StateCreator<PeersState, [], [], PeersState> = (set, get) => ({
  matches: [],
  hasProfile: true,
  isLoading: true,
  error: undefined,
  lastUpdated: undefined,
  fetchMatches: async () => {
    try {
      const response = await fetch('/api/peers', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      const data = await response.json();

      set({
        matches: data.matches || [],
        hasProfile: data.hasProfile !== false,
        isLoading: false,
        error: undefined,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch peer matches:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
  startPolling: () => {
    const { fetchMatches } = get();

    // Perform an immediate fetch
    fetchMatches();

    if (pollingTimer) {
      return;
    }

    pollingTimer = setInterval(() => {
      fetchMatches();
    }, POLL_INTERVAL_MS);
  },
  stopPolling: () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  },
});

export const usePeersStore = create<PeersState>(peersStateCreator);
