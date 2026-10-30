import { describe, expect, it } from 'vitest';

import { evaluate } from '../src/calc';
import {
  type AppState,
  type Calculation,
  emptyState,
  type Workshop,
} from '../src/model';

const calc = (id: string, rows: Calculation['rows'] = []): Calculation => ({
  id,
  name: `calc ${id}`,
  goals: [],
  solver: 'matrix',
  rows,
  built: 0,
  gameVersion: '1.2',
  recipeSignatures: {},
});

const workshop = (id: string, rows: Workshop['rows'] = []): Workshop => ({
  id,
  name: `workshop ${id}`,
  goals: [],
  solver: 'matrix',
  rows,
  gameVersion: '1.2',
  recipeSignatures: {},
});

const state = (
  calculations: Calculation[],
  workshops: Workshop[] = [],
): AppState => ({ ...emptyState(), calculations, workshops });

describe('evaluate cache', () => {
  const ws = workshop('w');
  const main = calc('a', [
    { kind: 'workshop', id: 'r1', workshop: 'w', copies: 1 },
  ]);
  const other = calc('b');

  it('reuses the result while the plan and its dependencies stay the same', () => {
    const first = evaluate(main, state([main, other], [ws]));
    const edited = { ...other, name: 'renamed' };
    expect(evaluate(main, state([main, edited], [ws]))).toBe(first);
  });

  it('computes again when a referenced workshop changes', () => {
    const first = evaluate(main, state([main, other], [ws]));
    const changed = { ...ws, name: 'changed' };
    expect(evaluate(main, state([main, other], [changed]))).not.toBe(first);
  });

  it('computes again when a referenced workshop is removed', () => {
    const first = evaluate(main, state([main, other], [ws]));
    expect(evaluate(main, state([main, other]))).not.toBe(first);
  });

  it('survives plants that reference each other', () => {
    const x = calc('x', [
      { kind: 'plant', id: 'r1', calculation: 'y', copies: 1 },
    ]);
    const y = calc('y', [
      { kind: 'plant', id: 'r2', calculation: 'x', copies: 1 },
    ]);
    const s = state([x, y]);
    expect(evaluate(x, s)).toBe(evaluate(x, s));
  });
});
