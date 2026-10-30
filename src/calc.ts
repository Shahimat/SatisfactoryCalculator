import {
  balance,
  type BalanceEntry,
  type CalcContext,
  carriers,
  emptyFlows,
  FLOW_EPSILON,
  type Flows,
  type RecipeChange,
  recipeChanges,
  recipeSignature,
  type Row,
  rowFlows,
  solve,
} from './engine';
import {
  buildings,
  catalog,
  isFluid,
  items,
  POWER_SHARD_ICON,
  recipes,
  SOMERSLOOP_ICON,
} from './catalog';
import type { AppState, Calculation, Plan, Units, Workshop } from './model';
import { plural, type PluralForms, t } from './i18n';

const isRowValid = (row: Row): boolean => {
  switch (row.kind) {
    case 'recipe': {
      return recipes.has(row.recipe);
    }
    case 'extractor':
    case 'generator': {
      return buildings.has(row.building);
    }
    default: {
      return true;
    }
  }
};

/**
 * Whether the solver chooses the row's building count. A row locked at an
 * output never is. Without an explicit
 * choice, rows of a plan with goals are solved and rows of a plan without
 * goals keep entered counts — plans saved before goals existed stay as they were.
 */
export const isAutoRow = (row: Row, plan: Pick<Plan, 'goals'>): boolean => {
  if (row.kind === 'generator') return false;
  if ('output' in row && row.output) return false;
  if (row.sizing) return row.sizing === 'auto';
  return plan.goals.length > 0;
};

/**
 * Workshops and calculations a plan reads through its rows, transitively and
 * in visit order. State is immutable, so a cached result stays valid while
 * the plan and every entity here are the same objects.
 */
const dependencies = (plan: Plan, state: AppState): unknown[] => {
  const found: unknown[] = [];
  const seen = new Set<Plan>([plan]);
  const visit = (entity: Plan): void => {
    for (const row of entity.rows) {
      let dep: Plan | undefined;
      if (row.kind === 'workshop') {
        dep = state.workshops.find((w) => w.id === row.workshop);
      } else if (row.kind === 'plant') {
        dep = state.calculations.find((c) => c.id === row.calculation);
      } else {
        continue;
      }
      found.push(dep);
      if (dep && !seen.has(dep)) {
        seen.add(dep);
        visit(dep);
      }
    }
  };
  visit(plan);
  return found;
};

type Cached<T> = { deps: unknown[]; value: T };

/** Result for a plan, computed again only when the plan or its dependencies change. */
const memoized = <T>(
  cache: WeakMap<Plan, Cached<T>>,
  plan: Plan,
  state: AppState,
  compute: () => T,
): T => {
  const deps = dependencies(plan, state);
  const hit = cache.get(plan);
  if (
    hit &&
    hit.deps.length === deps.length &&
    hit.deps.every((dep, index) => dep === deps[index])
  ) {
    return hit.value;
  }
  const value = compute();
  cache.set(plan, { deps, value });
  return value;
};

const solved = new WeakMap<Plan, Cached<ReturnType<typeof solve>>>();

const solvePlan = (plan: Plan, state: AppState, ctx: CalcContext) =>
  memoized(solved, plan, state, () =>
    solve(plan.solver, plan.rows.filter(isRowValid), ctx, plan.goals, (row) =>
      isAutoRow(row, plan),
    ),
  );

/** Engine context over the catalog and the user's entities; rows of removed recipes are skipped. */
export const calcContext = (state: AppState): CalcContext => {
  const ctx: CalcContext = {
    recipe: (id) => recipes.get(id),
    building: (id) => buildings.get(id),
    item: (id) => items.get(id),
    workshopRows: (id) => {
      const workshop = state.workshops.find((w) => w.id === id);
      return workshop && solvePlan(workshop, state, ctx).rows;
    },
    calculationRows: (id) => {
      const calc = state.calculations.find((c) => c.id === id);
      return calc && solvePlan(calc, state, ctx).rows;
    },
  };
  return ctx;
};

export type RowResult = {
  /** The row as entered by the user. */
  source: Row;
  /** The row with building counts chosen by the solver. */
  row: Row;
  flows: Flows;
  auto: boolean;
  error?: string;
};

export type Evaluation = {
  rows: RowResult[];
  total: Flows;
  balance: BalanceEntry[];
  /** The goals cannot be met: a loop loses material or needed rows are fixed. */
  infeasible: boolean;
};

const evaluations = new WeakMap<Plan, Cached<Evaluation>>();

/** Plan flows with solved building counts; cached, so callers must not mutate the result. */
export const evaluate = (plan: Plan, state: AppState): Evaluation =>
  memoized(evaluations, plan, state, () => compute(plan, state));

const compute = (plan: Plan, state: AppState): Evaluation => {
  const ctx = calcContext(state);
  const total = emptyFlows();
  const isAuto = (row: Row) => isRowValid(row) && isAutoRow(row, plan);
  const solution = solve(plan.solver, plan.rows, ctx, plan.goals, isAuto);
  const results = plan.rows.map((source, index): RowResult => {
    const row = solution.rows[index] ?? source;
    const base = { source, row, auto: isAuto(source) };
    if (!isRowValid(source)) {
      return { ...base, flows: emptyFlows(), error: 'removed' };
    }
    try {
      const flows = rowFlows(row, ctx);
      for (const [item, perMinute] of flows.items) {
        total.items.set(item, (total.items.get(item) ?? 0) + perMinute);
      }
      total.powerMW += flows.powerMW;
      total.generationMW += flows.generationMW;
      total.buildings += flows.buildings;
      total.somersloops += flows.somersloops;
      return { ...base, flows };
    } catch (error) {
      return { ...base, flows: emptyFlows(), error: (error as Error).message };
    }
  });
  return {
    rows: results,
    total,
    balance: balance(
      total,
      plan.goals.map((g) => g.item),
      ctx.item,
    ),
    infeasible: solution.status === 'infeasible',
  };
};

/** Power shards a building needs: each raises the clock limit by 50 %. */
const shardsFor = (clock: number): number =>
  clock > 1 ? Math.ceil((clock - 1) / 0.5 - 1e-9) : 0;

/**
 * Buildings a row stands for, with the shards and Somersloops slotted into
 * them. A fractional group still needs a whole building for its remainder.
 */
const placed = (
  row: Row,
):
  | { building: string; count: number; shards: number; somersloops: number }
  | undefined => {
  if (!('groups' in row)) return undefined;
  const building =
    row.kind === 'recipe' ? recipes.get(row.recipe)?.building : row.building;
  if (!building) return undefined;
  let count = 0;
  let shards = 0;
  let somersloops = 0;
  for (const g of row.groups) {
    if (g.count <= 0) continue;
    const whole = Math.floor(g.count + 1e-9);
    const fraction = g.count - whole;
    const total = whole + (fraction > 1e-9 ? 1 : 0);
    count += total;
    somersloops += g.somersloops * total;
    shards += shardsFor(g.clock) * whole;
    if (fraction > 1e-9) shards += shardsFor(g.clock * fraction);
  }
  return count > 0 ? { building, count, shards, somersloops } : undefined;
};

/** Copies to place: a partly loaded last copy is still a whole one. */
export const placedCopies = (copies: number): number =>
  Math.ceil(copies - 1e-9);

/** Load of a partly loaded last copy, 0–1; undefined when every copy is full. */
export const lastCopyLoad = (copies: number): number | undefined => {
  const load = copies - Math.floor(copies);
  return load > 1e-6 ? load : undefined;
};

export const copiesLabel = (copies: number): string => {
  const load = lastCopyLoad(copies);
  return `×${placedCopies(copies)}${load === undefined ? '' : t.copies.lastLoad(plain(load * 100))}`;
};

export type BuildList = {
  /** Building id → whole buildings to place. */
  buildings: Map<string, number>;
  workshops: { id: string; name: string; copies: number }[];
  plants: { id: string; name: string; copies: number }[];
  /** Item → amount to build everything, workshop contents included, with shards and Somersloops. */
  cost: Map<string, number>;
  /** Whole buildings to place, workshop contents included. */
  placed: number;
};

/**
 * What the solved plan asks to build. Workshops count with their buildings;
 * plants are other calculations and are built there, so they add no cost here.
 */
export const buildList = (
  evaluation: Evaluation,
  state: AppState,
): BuildList => {
  const ctx = calcContext(state);
  const list: BuildList = {
    buildings: new Map(),
    workshops: [],
    plants: [],
    cost: new Map(),
    placed: 0,
  };
  const add = (item: string, amount: number) => {
    if (amount > 0) list.cost.set(item, (list.cost.get(item) ?? 0) + amount);
  };
  const addCost = (row: Row, copies: number) => {
    const p = placed(row);
    if (!p) return;
    list.placed += p.count * copies;
    for (const { item, amount } of buildings.get(p.building)?.buildCost ?? [])
      add(item, amount * p.count * copies);
    add(POWER_SHARD_ICON, p.shards * copies);
    add(SOMERSLOOP_ICON, p.somersloops * copies);
  };
  const walk = (rows: Row[], copies: number, seen: Set<string>) => {
    for (const row of rows) {
      if (row.kind === 'workshop') {
        if (seen.has(row.workshop)) continue;
        walk(
          ctx.workshopRows(row.workshop) ?? [],
          copies * placedCopies(row.copies),
          new Set([...seen, row.workshop]),
        );
        continue;
      }
      addCost(row, copies);
    }
  };
  for (const { row, error } of evaluation.rows) {
    if (error) continue;
    if (row.kind === 'workshop') {
      list.workshops.push({
        id: row.workshop,
        name: state.workshops.find((w) => w.id === row.workshop)?.name ?? '—',
        copies: placedCopies(row.copies),
      });
    } else if (row.kind === 'plant') {
      list.plants.push({
        id: row.calculation,
        name:
          state.calculations.find((c) => c.id === row.calculation)?.name ?? '—',
        copies: placedCopies(row.copies),
      });
      continue;
    }
    const p = placed(row);
    if (p)
      list.buildings.set(
        p.building,
        (list.buildings.get(p.building) ?? 0) + p.count,
      );
  }
  walk(
    evaluation.rows.flatMap(({ row, error }) => (error ? [] : [row])),
    1,
    new Set(),
  );
  return list;
};

/** A loose set of rows, e.g. a preview, evaluated as entered. */
export const asPlan = (rows: Row[]): Plan => ({
  rows,
  goals: [],
  solver: 'matrix',
});

type LegacyPlan = Partial<Plan> & { rows: Row[]; targets?: string[] };

/**
 * Brings a calculation or workshop saved before goals and solver modes to the
 * current shape: former targets become goals at what the rows produced, and the
 * rows keep top-to-bottom sizing they were built with.
 */
export const migratePlan = <T extends LegacyPlan>(
  entity: T,
): Omit<T, 'targets'> & Plan => {
  if (entity.goals && entity.solver) return entity as Omit<T, 'targets'> & Plan;
  const { targets = [], ...rest } = entity;
  const ctx: CalcContext = {
    recipe: (id) => recipes.get(id),
    building: (id) => buildings.get(id),
    item: (id) => items.get(id),
    workshopRows: () => [],
    calculationRows: () => [],
  };
  const produced = (item: string) =>
    entity.rows.filter(isRowValid).reduce((sum, row) => {
      try {
        return sum + Math.max(0, rowFlows(row, ctx).items.get(item) ?? 0);
      } catch {
        return sum;
      }
    }, 0);
  return {
    ...rest,
    goals:
      entity.goals ??
      targets.map((item) => ({ item, perMinute: produced(item) })),
    solver: entity.solver ?? 'sequential',
  };
};

export const signaturesFor = (rows: Row[]): Record<string, string> =>
  Object.fromEntries(
    rows.flatMap((row) => {
      const recipe =
        row.kind === 'recipe' ? recipes.get(row.recipe) : undefined;
      return recipe ? [[recipe.id, recipeSignature(recipe)]] : [];
    }),
  );

/** Recipe changes of an entity saved on another game version (or with removed recipes). */
export const versionChanges = (
  entity: Calculation | Workshop,
): RecipeChange[] => {
  const removed = entity.rows.flatMap((row) =>
    row.kind === 'recipe' && !recipes.has(row.recipe)
      ? [{ recipe: row.recipe, status: 'removed' as const }]
      : [],
  );
  if (entity.gameVersion === catalog.version) return removed;
  const changes = recipeChanges(entity.recipeSignatures, (id) =>
    recipes.get(id),
  );
  const known = new Set(changes.map((c) => c.recipe));
  return [...changes, ...removed.filter((r) => !known.has(r.recipe))];
};

/** Takes the current game data as the new baseline; removed recipes stay flagged in rows. */
export const acknowledgeVersion = <T extends Calculation | Workshop>(
  entity: T,
): T => ({
  ...entity,
  gameVersion: catalog.version,
  recipeSignatures: signaturesFor(entity.rows),
});

// formatting

const BELTS = catalog.logistics.belts.map((b) => b.itemsPerMinute);
const PIPES = catalog.logistics.pipes.map((p) => p.m3PerMinute);

const trim = (value: number, digits: number): string =>
  Number.parseFloat(value.toFixed(digits)).toString();

export const signed = (value: number, digits = 2): string => {
  const rounded = Number.parseFloat(value.toFixed(digits));
  if (rounded === 0) return '0';
  return `${rounded > 0 ? '+' : '−'}${trim(Math.abs(rounded), digits)}`;
};

export const plain = (value: number, digits = 2): string => trim(value, digits);

/**
 * A flow in the selected units. Solids divide by the belt of the selected level,
 * fluids by the pipe — Mk.1 pipe for Mk.1 belts, Mk.2 pipe above, as pipes have two levels.
 */
export const flowValue = (
  item: string,
  perMinute: number,
  units: Units,
): { value: string; unit: string } => {
  const fluid = isFluid(item);
  if (units === 'ipm') {
    return {
      value: signed(perMinute),
      unit: fluid ? t.units.fluid : t.units.ipm,
    };
  }
  if (fluid) {
    const level = Math.min(units, PIPES.length);
    const sign = perMinute < 0 ? -1 : 1;
    return {
      value: signed(sign * carriers(perMinute, PIPES[level - 1]!)),
      unit: t.units.pipes(level),
    };
  }
  const sign = perMinute < 0 ? -1 : 1;
  return {
    value: signed(sign * carriers(perMinute, BELTS[units - 1]!)),
    unit: t.units.belts(units),
  };
};

/** A number with its counted word: `countLabel(3, t.count.rows)` → «3 строки». */
export const countLabel = (n: number, forms: PluralForms): string =>
  `${plain(n)} ${plural(n, forms)}`;

/** Per-item flows split into consumed and produced, solids before fluids. */
export const splitFlows = (flows: Map<string, number>) => {
  const entries = [...flows].filter(([, v]) => Math.abs(v) > FLOW_EPSILON);
  const order = ([a]: [string, number], [b]: [string, number]) =>
    Number(isFluid(a)) - Number(isFluid(b));
  return {
    inputs: entries.filter(([, v]) => v < 0).sort(order),
    outputs: entries.filter(([, v]) => v > 0).sort(order),
  };
};
