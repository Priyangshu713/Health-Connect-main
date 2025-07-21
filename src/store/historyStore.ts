import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HealthData, AnalysisSection } from '@/store/healthStore';

export interface HistoryEntry {
  id: string;
  date: string;
  healthData: HealthData;
  analysis?: AnalysisSection[];
  timeOfDay?: string; // e.g., "10:22 AM"
  dayOfWeek?: string; // e.g., "Monday"
}

interface HistoryStore {
  historyEntries: HistoryEntry[];
  loading: boolean;
  addHistoryEntry: (healthData: HealthData, analysis?: AnalysisSection[]) => void;
  getEntryById: (id: string) => HistoryEntry | undefined;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      historyEntries: [],
      loading: false,

      addHistoryEntry: (healthData, analysis) => {
        const now = new Date();
        // Format time as "10:22 AM"
        const timeOfDay = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        // Get day of week (e.g., "Monday")
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });

        // Create a new entry with the current timestamp
        const newEntry: HistoryEntry = {
          id: crypto.randomUUID(),
          date: now.toISOString(),
          healthData: { ...healthData },
          analysis: analysis ? [...analysis] : undefined,
          timeOfDay,
          dayOfWeek
        };

        set((state) => ({
          historyEntries: [newEntry, ...state.historyEntries]
        }));
      },

      getEntryById: (id) => {
        return get().historyEntries.find(entry => entry.id === id);
      },

      clearHistory: () => {
        set({ historyEntries: [] });
      }
    }),
    {
      name: 'health-history-storage',
      // Use localStorage instead of sessionStorage to persist across browser sessions
      storage: {
        getItem: async (name) => {
          if (typeof window === 'undefined') return null;
          const str = window.localStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: async (name, value) => {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: async (name) => {
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(name);
          }
        },
      }
    }
  )
);
