import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PersonaResult } from '../../shared/types';

interface AppState {
  currentUser: User | null;
  currentAssessment: PersonaResult | null;
  sharerInfo: { sharerId: string; assessmentId: string } | null;
  setCurrentUser: (user: User | null) => void;
  setCurrentAssessment: (assessment: PersonaResult | null) => void;
  setSharerInfo: (info: { sharerId: string; assessmentId: string } | null) => void;
  clearAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentUser: null,
      currentAssessment: null,
      sharerInfo: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),
      setSharerInfo: (info) => set({ sharerInfo: info }),
      clearAll: () => set({ currentUser: null, currentAssessment: null, sharerInfo: null })
    }),
    {
      name: 'persona-app-storage'
    }
  )
);
