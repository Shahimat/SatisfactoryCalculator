import { afterEach, describe, expect, it } from 'vitest';

import { countLabel } from '../src/calc';
import { itemName } from '../src/catalog';
import { applyMessages, t } from '../src/i18n';
import { en } from '../src/i18n/en';
import { ru } from '../src/i18n/ru';

afterEach(() => applyMessages('ru', ru));

describe('plural forms', () => {
  it('follows Russian rules, fractions take the «few» form', () => {
    applyMessages('ru', ru);
    const rows = (n: number) => countLabel(n, t.count.rows);
    expect([1, 2, 5, 11, 14, 21, 22, 25, 1.5].map(rows)).toEqual([
      '1 строка',
      '2 строки',
      '5 строк',
      '11 строк',
      '14 строк',
      '21 строка',
      '22 строки',
      '25 строк',
      '1.5 строки',
    ]);
  });

  it('follows English rules', () => {
    applyMessages('en', en);
    const rows = (n: number) => countLabel(n, t.count.rows);
    expect([0, 1, 2, 21, 1.5].map(rows)).toEqual([
      '0 rows',
      '1 row',
      '2 rows',
      '21 rows',
      '1.5 rows',
    ]);
  });
});

describe('language switch', () => {
  it('names catalog entries in the current language', () => {
    applyMessages('ru', ru);
    expect(itemName('Desc_IronPlate_C')).toBe('Железная пластина');
    applyMessages('en', en);
    expect(itemName('Desc_IronPlate_C')).toBe('Iron Plate');
  });

  it('leaves no Russian text in the English dictionary', () => {
    const texts: string[] = [];
    const walk = (value: unknown): void => {
      if (typeof value === 'string') texts.push(value);
      else if (typeof value === 'function') texts.push(String(value(1, '1')));
      else if (value && typeof value === 'object')
        Object.values(value).forEach(walk);
    };
    walk(en);
    expect(texts.filter((text) => /[А-Яа-яЁё]/.test(text))).toEqual([]);
  });
});
