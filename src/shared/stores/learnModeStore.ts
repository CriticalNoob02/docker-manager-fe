"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LearnModeState {
  learnMode: boolean;
  toggleLearnMode: () => void;
  setLearnMode: (value: boolean) => void;
}

/** Persiste no localStorage para manter a preferência entre sessões */
export const useLearnModeStore = create<LearnModeState>()(
  persist(
    (set) => ({
      learnMode: false,
      toggleLearnMode: () => set((s) => ({ learnMode: !s.learnMode })),
      setLearnMode: (value) => set({ learnMode: value }),
    }),
    { name: "radar-learn-mode" }
  )
);
