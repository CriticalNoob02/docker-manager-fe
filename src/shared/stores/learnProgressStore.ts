"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CONCEPT_ORDER = [
  "container",
  "image",
  "layers",
  "dockerfile",
  "port-binding",
  "environment-variables",
  "volume",
  "network",
  "docker-socket",
  "compose",
  "swarm",
  "swarm-node",
  "swarm-service",
  "swarm-task",
  "swarm-stack",
  "swarm-overlay-network",
] as const;

/** Conceitos sem questão de quiz — desbloqueados via "Marcar como lido" */
export const CONCEPTS_WITHOUT_QUIZ = new Set([
  "environment-variables",
  "swarm-task",
  "swarm-stack",
]);

interface LearnProgressState {
  completedSlugs: string[];
  unlockedSlugs: string[];
  markCompleted: (slug: string) => void;
  resetProgress: () => void;
}

export const useLearnProgressStore = create<LearnProgressState>()(
  persist(
    (set, get) => ({
      completedSlugs: [],
      unlockedSlugs: ["container"],

      markCompleted: (slug) => {
        const { completedSlugs, unlockedSlugs } = get();
        if (completedSlugs.includes(slug)) return;

        const idx = CONCEPT_ORDER.indexOf(slug as typeof CONCEPT_ORDER[number]);
        const nextSlug = idx >= 0 && idx + 1 < CONCEPT_ORDER.length
          ? CONCEPT_ORDER[idx + 1]
          : null;

        set({
          completedSlugs: [...completedSlugs, slug],
          unlockedSlugs: nextSlug && !unlockedSlugs.includes(nextSlug)
            ? [...unlockedSlugs, nextSlug]
            : unlockedSlugs,
        });
      },

      resetProgress: () =>
        set({ completedSlugs: [], unlockedSlugs: ["container"] }),
    }),
    { name: "radar-learn-progress" }
  )
);
