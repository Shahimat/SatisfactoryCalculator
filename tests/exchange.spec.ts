import { describe, expect, it } from 'vitest';

import {
  applyImport,
  buildExport,
  dependencies,
  importEntries,
  parseExport,
} from '../src/exchange';
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
  rows,
  goals: [],
  solver: 'matrix',
  gameVersion: '1.2',
  recipeSignatures: {},
});

const state: AppState = {
  ...emptyState(),
  calculations: [
    calc('base', [
      { kind: 'workshop', id: 'r1', workshop: 'w1', copies: 1 },
      { kind: 'plant', id: 'r2', calculation: 'power', copies: 2 },
    ]),
    calc('power', [{ kind: 'workshop', id: 'r3', workshop: 'w2', copies: 1 }]),
    calc('other'),
  ],
  workshops: [workshop('w1'), workshop('w2'), workshop('w3')],
};

const select = (calculations: string[], workshops: string[] = []) => ({
  calculations: new Set(calculations),
  workshops: new Set(workshops),
});

describe('export', () => {
  it('pulls dependencies transitively and names who needs them', () => {
    const deps = dependencies(state, select(['base']));
    expect(Object.fromEntries(deps.calculations)).toEqual({
      power: 'calc base',
    });
    expect(Object.fromEntries(deps.workshops)).toEqual({
      w1: 'calc base',
      w2: 'calc power',
    });
  });

  it('builds a file with selection and dependencies only', () => {
    const file = buildExport(
      state,
      select(['base']),
      '1.2',
      new Date('2026-10-28T10:00:00Z'),
    );
    expect(file.calculations.map((c) => c.id)).toEqual(['base', 'power']);
    expect(file.workshops.map((w) => w.id)).toEqual(['w1', 'w2']);
    expect(file.gameVersion).toBe('1.2');
    expect(parseExport(JSON.stringify(file))).toEqual(file);
  });

  it('rejects foreign files', () => {
    expect(() => parseExport('{"hello":1}')).toThrow(/не файл экспорта/);
    expect(() => parseExport('not json')).toThrow(/JSON/);
  });
});

describe('import', () => {
  const file = buildExport(state, select(['base']), '1.2', new Date());

  it('marks entities that already exist by uuid', () => {
    const fresh: AppState = { ...emptyState(), calculations: [calc('power')] };
    expect(importEntries(fresh, file).map((e) => [e.id, e.exists])).toEqual([
      ['base', false],
      ['power', true],
      ['w1', false],
      ['w2', false],
    ]);
  });

  it('adds matches as copies with new uuids and keeps references inside the copies', () => {
    const merged = applyImport(state, file, 'copy');
    expect(merged.calculations).toHaveLength(5);
    expect(merged.workshops).toHaveLength(5);
    const copiedBase = merged.calculations.find(
      (c) => c.name === 'calc base (импорт)',
    );
    const copiedPower = merged.calculations.find(
      (c) => c.name === 'calc power (импорт)',
    );
    const copiedW1 = merged.workshops.find(
      (w) => w.name === 'workshop w1 (импорт)',
    );
    expect(copiedBase?.id).not.toBe('base');
    expect(copiedBase?.rows).toEqual([
      { kind: 'workshop', id: 'r1', workshop: copiedW1?.id, copies: 1 },
      { kind: 'plant', id: 'r2', calculation: copiedPower?.id, copies: 2 },
    ]);
  });

  it('replaces matches in place of the existing versions', () => {
    const changed = {
      ...file,
      calculations: file.calculations.map((c) => ({ ...c, built: 3 })),
    };
    const merged = applyImport(state, changed, 'replace');
    expect(merged.calculations).toHaveLength(3);
    expect(merged.calculations.find((c) => c.id === 'base')?.built).toBe(3);
    expect(merged.workshops).toHaveLength(3);
  });
});
