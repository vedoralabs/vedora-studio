"use client";

import { useSyncExternalStore } from "react";
import type { BriefResult } from "@/lib/discovery/results";
import type { ProjectCategory, VisualQuality } from "@/types/project";

/**
 * Lightweight, session-only memory of what a visitor explored.
 * Lives in sessionStorage on this device, disappears when the tab closes,
 * and is never sent anywhere except as part of a request the visitor makes.
 */
export interface ExplorationState {
  readonly viewed: readonly string[];
  readonly qualities: readonly VisualQuality[];
  readonly categories: readonly ProjectCategory[];
  readonly conversation: readonly string[];
  readonly brief: BriefResult | null;
}

const storageKey = "vedora:exploration:v1";
const emptyState: ExplorationState = { viewed: [], qualities: [], categories: [], conversation: [], brief: null };
const listeners = new Set<() => void>();
let state: ExplorationState = emptyState;
let loaded = false;

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.sessionStorage.getItem(storageKey);
    if (raw) state = { ...emptyState, ...(JSON.parse(raw) as Partial<ExplorationState>) };
  } catch {
    state = emptyState;
  }
}

function persist() {
  try {
    window.sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Storage can be unavailable (private mode, blocked site data); memory still works for this page.
  }
}

function update(next: (current: ExplorationState) => ExplorationState) {
  load();
  state = next(state);
  persist();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

const getServerSnapshot = () => emptyState;

export function useExploration(): ExplorationState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const recentFirst = <T,>(items: readonly T[], item: T, limit: number) => [item, ...items.filter((existing) => existing !== item)].slice(0, limit);

export const exploration = {
  recordView(slug: string, category: ProjectCategory) {
    update((current) => ({
      ...current,
      viewed: recentFirst(current.viewed, slug, 8),
      categories: recentFirst(current.categories, category, 4),
    }));
  },
  setQualities(qualities: readonly VisualQuality[]) {
    update((current) => ({ ...current, qualities: qualities.slice(0, 4) }));
  },
  rememberMessage(message: string) {
    update((current) => ({ ...current, conversation: [...current.conversation, message].slice(-3) }));
  },
  clearConversation() {
    update((current) => ({ ...current, conversation: [] }));
  },
  saveBrief(brief: BriefResult | null) {
    update((current) => ({ ...current, brief }));
  },
  forget() {
    update(() => emptyState);
  },
};
