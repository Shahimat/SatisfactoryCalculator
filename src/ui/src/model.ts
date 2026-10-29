import type { Goal, Row, SolverMode } from '../../engine/src/calc';

/** What a calculation or a workshop produces and how its rows are sized. */
export type Plan = {
  rows: Row[];
  /** Outputs requested per minute. */
  goals: Goal[];
  solver: SolverMode;
};

export type Calculation = Plan & {
  id: string;
  name: string;
  /** Built copies in the energy grid; 0 is a draft. */
  built: number;
  /** Game data version the recipe signatures were taken from. */
  gameVersion: string;
  recipeSignatures: Record<string, string>;
};

export type Workshop = Plan & {
  id: string;
  name: string;
  gameVersion: string;
  recipeSignatures: Record<string, string>;
};

export type Units = 'ipm' | 1 | 2 | 3 | 4 | 5 | 6;

export type AppState = {
  schema: 1;
  calculations: Calculation[];
  workshops: Workshop[];
  units: Units;
};

export const emptyState = (): AppState => ({
  schema: 1,
  calculations: [],
  workshops: [],
  units: 'ipm',
});

export const newId = (): string => crypto.randomUUID();

/** Entities whose rows reference other entities by id. */
type WithRows = { rows: Row[] };

export const referencedWorkshops = (entity: WithRows): string[] =>
  entity.rows.flatMap((row) => (row.kind === 'workshop' ? [row.workshop] : []));

export const referencedCalculations = (entity: WithRows): string[] =>
  entity.rows.flatMap((row) => (row.kind === 'plant' ? [row.calculation] : []));

export const recipeIds = (entity: WithRows): string[] =>
  entity.rows.flatMap((row) => (row.kind === 'recipe' ? [row.recipe] : []));
