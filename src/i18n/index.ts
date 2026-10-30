import { useSyncExternalStore } from 'react';

import type { Messages } from './ru';

export type { Messages };
export type Locale = 'ru' | 'en';

export const LOCALES: { value: Locale; label: string }[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
];

const STORAGE_KEY = 'satisfactory-calculator/locale';

/**
 * Messages of the current language. The binding is live and set before the app
 * is imported (src/index.tsx), so components read it synchronously while
 * rendering; module-level constants must not capture its strings.
 */
let t = undefined as unknown as Messages;
let locale: Locale = 'en';
let pluralRules = new Intl.PluralRules('en');
export { t };

const listeners = new Set<() => void>();

/** The saved choice, otherwise Russian for a Russian browser and English for the rest. */
export const initialLocale = (): Locale => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'ru' || saved === 'en') return saved;
  } catch {
    // Storage may be blocked; fall back to the browser language.
  }
  return navigator.languages.some((l) => l.toLowerCase().startsWith('ru'))
    ? 'ru'
    : 'en';
};

/** Makes `messages` current; tests call it directly with an imported dictionary. */
export const applyMessages = (next: Locale, messages: Messages): void => {
  t = messages;
  locale = next;
  pluralRules = new Intl.PluralRules(next);
  if (typeof document === 'undefined') return;
  document.documentElement.lang = next;
  document.title = messages.app.title;
};

/** Each dictionary is its own chunk: only the chosen language is downloaded. */
export const loadLocale = async (next: Locale): Promise<void> => {
  const messages =
    next === 'ru'
      ? (await import(/* webpackChunkName: "i18n-ru" */ './ru')).ru
      : (await import(/* webpackChunkName: "i18n-en" */ './en')).en;
  applyMessages(next, messages);
};

export const setLocale = async (next: Locale): Promise<void> => {
  await loadLocale(next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // The choice still applies for this session.
  }
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** Re-renders on a language switch; the app root uses it so the whole tree updates. */
export const useLocale = (): Locale =>
  useSyncExternalStore(subscribe, () => locale);

export const currentLocale = (): Locale => locale;

/** Word forms by `Intl.PluralRules` category; a missing category takes `other`. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};

export const plural = (n: number, forms: PluralForms): string =>
  forms[pluralRules.select(n)] ?? forms.other;

/** Name of a catalog entry in the current language. */
export const localName = (entry: { name: Record<Locale, string> }): string =>
  entry.name[locale];

export const compareNames = (
  a: { name: Record<Locale, string> },
  b: { name: Record<Locale, string> },
): number => a.name[locale].localeCompare(b.name[locale], locale);

export const formatDate = (date: Date): string =>
  date.toLocaleDateString(locale);
