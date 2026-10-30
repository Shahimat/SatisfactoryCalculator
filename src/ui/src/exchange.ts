import type { Row } from '../../engine/src/calc';
import {
  type AppState,
  type Calculation,
  newId,
  referencedCalculations,
  referencedWorkshops,
  type Workshop,
} from './model';
import { t } from './i18n';

export const EXPORT_FORMAT = 'satisfactory-calculator';

export type ExportFile = {
  format: typeof EXPORT_FORMAT;
  schema: 1;
  gameVersion: string;
  exportedAt: string;
  calculations: Calculation[];
  workshops: Workshop[];
};

export type Selection = { calculations: Set<string>; workshops: Set<string> };

/** Why an entity joined the export: the entity that needs it. */
export type Dependencies = {
  calculations: Map<string, string>;
  workshops: Map<string, string>;
};

/**
 * Entities required by the selection: workshops used in rows, calculations used as
 * plants, transitively. Each one points to the first entity that needed it.
 */
export const dependencies = (
  state: AppState,
  selection: Selection,
): Dependencies => {
  const deps: Dependencies = { calculations: new Map(), workshops: new Map() };
  const calcById = new Map(state.calculations.map((c) => [c.id, c]));
  const workshopById = new Map(state.workshops.map((w) => [w.id, w]));
  const queue: { rows: Row[]; name: string }[] = [
    ...[...selection.calculations].flatMap((id) => calcById.get(id) ?? []),
    ...[...selection.workshops].flatMap((id) => workshopById.get(id) ?? []),
  ];
  while (queue.length > 0) {
    const entity = queue.shift()!;
    for (const id of referencedWorkshops(entity)) {
      const workshop = workshopById.get(id);
      if (!workshop || selection.workshops.has(id) || deps.workshops.has(id))
        continue;
      deps.workshops.set(id, entity.name);
      queue.push(workshop);
    }
    for (const id of referencedCalculations(entity)) {
      const calc = calcById.get(id);
      if (!calc || selection.calculations.has(id) || deps.calculations.has(id))
        continue;
      deps.calculations.set(id, entity.name);
      queue.push(calc);
    }
  }
  return deps;
};

export const buildExport = (
  state: AppState,
  selection: Selection,
  gameVersion: string,
  now: Date,
): ExportFile => {
  const deps = dependencies(state, selection);
  const wantCalc = (id: string) =>
    selection.calculations.has(id) || deps.calculations.has(id);
  const wantWorkshop = (id: string) =>
    selection.workshops.has(id) || deps.workshops.has(id);
  return {
    format: EXPORT_FORMAT,
    schema: 1,
    gameVersion,
    exportedAt: now.toISOString(),
    calculations: state.calculations.filter((c) => wantCalc(c.id)),
    workshops: state.workshops.filter((w) => wantWorkshop(w.id)),
  };
};

export const parseExport = (text: string): ExportFile => {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(t.exchange.notJson);
  }
  const file = data as Partial<ExportFile>;
  if (
    file?.format !== EXPORT_FORMAT ||
    file.schema !== 1 ||
    !Array.isArray(file.calculations) ||
    !Array.isArray(file.workshops)
  ) {
    throw new Error(t.exchange.notExport);
  }
  return file as ExportFile;
};

export type ImportMode = 'copy' | 'replace';

export type ImportEntry = {
  kind: 'calculation' | 'workshop';
  id: string;
  name: string;
  exists: boolean;
};

export const importEntries = (
  state: AppState,
  file: ExportFile,
): ImportEntry[] => {
  const calcIds = new Set(state.calculations.map((c) => c.id));
  const workshopIds = new Set(state.workshops.map((w) => w.id));
  return [
    ...file.calculations.map((c) => ({
      kind: 'calculation' as const,
      id: c.id,
      name: c.name,
      exists: calcIds.has(c.id),
    })),
    ...file.workshops.map((w) => ({
      kind: 'workshop' as const,
      id: w.id,
      name: w.name,
      exists: workshopIds.has(w.id),
    })),
  ];
};

/**
 * Merges the file into the state. Matching entities (same uuid) are either
 * replaced or added as copies with new uuids; references inside the imported
 * rows follow the copies so the imported set stays consistent.
 */
export const applyImport = (
  state: AppState,
  file: ExportFile,
  mode: ImportMode,
): AppState => {
  const calcIds = new Set(state.calculations.map((c) => c.id));
  const workshopIds = new Set(state.workshops.map((w) => w.id));
  const renamedCalcs = new Map<string, string>();
  const renamedWorkshops = new Map<string, string>();
  if (mode === 'copy') {
    for (const c of file.calculations)
      if (calcIds.has(c.id)) renamedCalcs.set(c.id, newId());
    for (const w of file.workshops)
      if (workshopIds.has(w.id)) renamedWorkshops.set(w.id, newId());
  }
  const remapRows = (rows: Row[]): Row[] =>
    rows.map((row) => {
      if (row.kind === 'workshop' && renamedWorkshops.has(row.workshop)) {
        return { ...row, workshop: renamedWorkshops.get(row.workshop)! };
      }
      if (row.kind === 'plant' && renamedCalcs.has(row.calculation)) {
        return { ...row, calculation: renamedCalcs.get(row.calculation)! };
      }
      return row;
    });
  const importedCalcs = file.calculations.map((c) => {
    const copyId = renamedCalcs.get(c.id);
    return copyId
      ? {
          ...c,
          id: copyId,
          name: c.name + t.exchange.importSuffix,
          rows: remapRows(c.rows),
        }
      : { ...c, rows: remapRows(c.rows) };
  });
  const importedWorkshops = file.workshops.map((w) => {
    const copyId = renamedWorkshops.get(w.id);
    return copyId
      ? {
          ...w,
          id: copyId,
          name: w.name + t.exchange.importSuffix,
          rows: remapRows(w.rows),
        }
      : { ...w, rows: remapRows(w.rows) };
  });
  const replacedCalcs = new Set(importedCalcs.map((c) => c.id));
  const replacedWorkshops = new Set(importedWorkshops.map((w) => w.id));
  return {
    ...state,
    calculations: [
      ...state.calculations.filter((c) => !replacedCalcs.has(c.id)),
      ...importedCalcs,
    ],
    workshops: [
      ...state.workshops.filter((w) => !replacedWorkshops.has(w.id)),
      ...importedWorkshops,
    ],
  };
};

export const exportFileName = (now: Date): string =>
  `satisfactory-calculator-${now.toISOString().slice(0, 10)}.json`;
