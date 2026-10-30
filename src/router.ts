import { useSyncExternalStore } from 'react';

const subscribe = (listener: () => void) => {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
};

/** Hash route split into segments: `#/calc/<id>` → `['calc', '<id>']`. */
export const useRoute = (): string[] => {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash);
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean);
};

export const navigate = (path: string): void => {
  window.location.hash = path;
};
