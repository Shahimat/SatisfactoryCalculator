import { useSyncExternalStore } from 'react';

import { migratePlan } from './calc';
import { type AppState, emptyState } from './model';

const STORAGE_KEY = 'satisfactory-calculator/state';

const load = (): AppState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as AppState;
    if (parsed.schema !== 1) return emptyState();
    return {
      ...emptyState(),
      ...parsed,
      calculations: parsed.calculations.map(migratePlan),
      workshops: parsed.workshops.map(migratePlan),
    };
  } catch {
    return emptyState();
  }
};

let state = load();
const listeners = new Set<() => void>();

export const getState = (): AppState => state;

export const setState = (update: (current: AppState) => AppState): void => {
  state = update(state);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage may be full or blocked; the session keeps working in memory.
  }
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useAppState = (): AppState =>
  useSyncExternalStore(subscribe, getState);
