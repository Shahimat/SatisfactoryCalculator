import { FLOW_EPSILON, groupsForTarget } from './analysis';
import { emptyFlows, mergeFlows, PURITY, rowFlows } from './flows';
import { minimize } from './simplex';
import type { BuildingGroup, CalcContext, Flows, Row } from './types';

/** Output the calculation must deliver, per minute. */
export type Goal = { item: string; perMinute: number };

/**
 * `sequential`: rows are sized top to bottom, each covering what goals and
 * rows above it lack, so the order of rows decides who supplies whom.
 * `matrix`: all auto rows are solved together; order does not matter and
 * loops balance.
 */
export type SolverMode = 'sequential' | 'matrix';

export type Solution = {
  /** Rows with building counts of `auto` rows chosen by the solver. */
  rows: Row[];
  status: 'ok' | 'infeasible';
};

/** Clock and Somersloop setup of a row, kept when its building count changes. */
const setup = (groups: BuildingGroup[]) => {
  const plain = groups.find((g) => g.somersloops === 0) ?? groups[0];
  const boosted = groups.filter((g) => g.somersloops > 0);
  return {
    clock: plain?.clock ?? 1,
    amplified: boosted.reduce((sum, g) => sum + g.count, 0),
    somersloops: boosted[0]?.somersloops ?? 0,
  };
};

type SizableRow = Extract<Row, { kind: 'recipe' | 'extractor' }>;

const buildingOf = (row: SizableRow, ctx: CalcContext) =>
  ctx.building(
    row.kind === 'recipe'
      ? (ctx.recipe(row.recipe)?.building ?? '')
      : row.building,
  );

/**
 * Plain buildings doing the work of `equivalent` buildings at `clock`.
 * At the default clock of 100 % the work goes to whole buildings evenly
 * underclocked — ten at 90 % rather than nine and a tenth. A building count
 * chosen by the user is kept and the clock follows, up to the building's
 * maximum. Any other clock was set on purpose: it stays and the last building
 * runs slower. A clock less than 1 % under 100 %, or a rounding hair above it,
 * is taken as 100 %.
 */
export const plainGroup = (
  row: SizableRow,
  ctx: CalcContext,
  equivalent: number,
  clock: number,
): BuildingGroup => {
  const work = Math.max(0, equivalent) * clock;
  const pinned = row.buildings && row.buildings > 0 ? row.buildings : undefined;
  if (pinned) {
    const maxClock = buildingOf(row, ctx)?.maxClock ?? 2.5;
    return {
      count: work > 1e-9 ? pinned : 0,
      clock: work > 1e-9 ? full(Math.min(maxClock, work / pinned)) : clock,
      somersloops: 0,
    };
  }
  if (clock !== 1) return { count: round(equivalent), clock, somersloops: 0 };
  const count = Math.ceil(work - 1e-4);
  return count > 0
    ? { count, clock: full(work / count), somersloops: 0 }
    : { count: 0, clock, somersloops: 0 };
};

/**
 * Somersloop buildings cut down to a smaller need: at the default clock the
 * remainder goes to whole buildings evenly underclocked, like plain ones.
 */
const wholeBoosted = (group: BuildingGroup): BuildingGroup => {
  if (group.clock !== 1) return group;
  const count = Math.ceil(group.count - 1e-4);
  return count > 0
    ? { ...group, count, clock: full(group.count / count) }
    : group;
};

/** Most work, in buildings at `clock`, a pinned building count can do. */
const pinnedLimit = (
  row: SizableRow,
  ctx: CalcContext,
  clock: number,
): number | undefined =>
  row.buildings && row.buildings > 0
    ? (row.buildings * (buildingOf(row, ctx)?.maxClock ?? 2.5)) / clock
    : undefined;

/**
 * An auto row as a linear term: flows of one plain building times the
 * solver variable, plus fixed flows of its Somersloop buildings, which the
 * user places by hand because Somersloops are scarce.
 */
type Term = {
  unit: Flows;
  base: Flows;
  build: (plain: number) => Row;
  /** Upper bound of the plain variable when the building count is pinned. */
  limit?: number;
};

const term = (row: Row, ctx: CalcContext): Term | undefined => {
  if (row.kind === 'workshop' || row.kind === 'plant') {
    try {
      return {
        unit: rowFlows({ ...row, copies: 1 }, ctx),
        base: emptyFlows(),
        build: (copies) => ({ ...row, copies: wholeCopies(copies) }),
      };
    } catch {
      return undefined;
    }
  }
  if (row.kind !== 'recipe' && row.kind !== 'extractor') return undefined;
  const { clock, amplified, somersloops } = setup(row.groups);
  const atClock = (count: number): BuildingGroup => ({
    count,
    clock,
    somersloops: 0,
  });
  const boosted: BuildingGroup[] =
    row.kind === 'recipe' && amplified > 0
      ? [{ count: amplified, clock, somersloops }]
      : [];
  const withGroups = (groups: BuildingGroup[]): Row => ({ ...row, groups });
  try {
    return {
      unit: rowFlows(withGroups([atClock(1)]), ctx),
      base:
        boosted.length > 0 ? rowFlows(withGroups(boosted), ctx) : emptyFlows(),
      build: (plain) => {
        const sized = plainGroup(row, ctx, plain, clock);
        const groups = [...(sized.count > 0 ? [sized] : []), ...boosted];
        return withGroups(groups.length > 0 ? groups : [atClock(0)]);
      },
      limit: pinnedLimit(row, ctx, clock),
    };
  } catch {
    return undefined;
  }
};

/**
 * Rows locked at an exact output get building counts for it; the solver then
 * treats them as fixed, so their number is never raised by other rows' demand.
 */
const lockOutputs = (
  rows: Row[],
  ctx: CalcContext,
  isAuto: (row: Row) => boolean,
) => ({
  rows: rows.map((row) =>
    'output' in row && row.output
      ? rowForOutput(row, ctx, row.output.item, row.output.perMinute)
      : row,
  ),
  isAuto: (row: Row) => !('output' in row && row.output) && isAuto(row),
});

/** Building counts are never negative: a surplus leaves a row idle, not reversed. */
const round = (value: number): number =>
  Math.max(0, Math.round(value * 1e6) / 1e6);

/**
 * A computed clock; less than 1 % under 100 % is not worth an underclock, and
 * a hair above it is rounding left by the rows before.
 */
const full = (clock: number): number =>
  clock >= 0.99 && clock <= 1.0001 ? 1 : round(clock);

/**
 * Copies of a workshop or plant are whole; what the need leaves over runs the
 * last copy partly loaded. Like a clock, a load within 1 % of whole is whole.
 */
const wholeCopies = (copies: number): number => {
  const value = round(copies);
  const whole = Math.floor(value);
  const load = value - whole;
  if (load >= 0.99) return whole + 1;
  return load <= 1e-4 ? whole : value;
};

/**
 * Chooses building counts of `auto` rows so that goals are met and nothing the
 * auto rows can make runs short, with as few buildings as possible. The whole
 * set is solved at once, so row order does not matter and loops — a byproduct
 * fed back as input, like water in aluminium — balance themselves. Fixed rows,
 * workshops and plants contribute as they are.
 */
export const solveRows = (
  entered: Row[],
  ctx: CalcContext,
  goals: Goal[],
  autoEntered: (row: Row) => boolean,
): Solution => {
  const { rows, isAuto } = lockOutputs(entered, ctx, autoEntered);
  const fixed = emptyFlows();
  const terms = new Map<number, Term>();
  rows.forEach((row, index) => {
    const auto = isAuto(row) ? term(row, ctx) : undefined;
    if (auto) {
      terms.set(index, auto);
      mergeFlows(fixed, auto.base);
      return;
    }
    try {
      mergeFlows(fixed, rowFlows(row, ctx));
    } catch {
      // An invalid row is reported by the caller's evaluation.
    }
  });
  if (terms.size === 0) return { rows, status: 'ok' };

  const variables = [...terms.values()];
  const producible = new Set(
    variables.flatMap((t) =>
      [...t.unit.items].filter(([, v]) => v > 0).map(([item]) => item),
    ),
  );
  const demand = new Map(goals.map((g) => [g.item, g.perMinute]));
  const items = [...producible];
  const a = items.map((item) =>
    variables.map((t) => t.unit.items.get(item) ?? 0),
  );
  const b = items.map(
    (item) => (demand.get(item) ?? 0) - (fixed.items.get(item) ?? 0),
  );
  // A pinned building count caps its variable: -x ≥ -limit.
  variables.forEach((t, i) => {
    if (t.limit === undefined) return;
    a.push(variables.map((_, j) => (j === i ? -1 : 0)));
    b.push(-t.limit);
  });
  const result = minimize(
    variables.map(() => 1),
    a,
    b,
  );
  if (result.status === 'infeasible') return { rows, status: 'infeasible' };

  const counts = new Map(
    [...terms.keys()].map((index, i) => [index, round(result.x[i] ?? 0)]),
  );
  return {
    rows: rows.map(
      (row, index) => terms.get(index)?.build(counts.get(index) ?? 0) ?? row,
    ),
    status: 'ok',
  };
};

/** Sizes auto rows top to bottom: goals first, then what each row above needs. */
export const solveSequential = (
  entered: Row[],
  ctx: CalcContext,
  goals: Goal[],
  autoEntered: (row: Row) => boolean,
): Solution => {
  const { rows, isAuto } = lockOutputs(entered, ctx, autoEntered);
  const above = emptyFlows();
  for (const goal of goals) {
    above.items.set(
      goal.item,
      (above.items.get(goal.item) ?? 0) - goal.perMinute,
    );
  }
  const shortage = (item: string) => Math.max(0, -(above.items.get(item) ?? 0));
  const sized = rows.map((row) => {
    let current = row;
    const auto = isAuto(row) ? term(row, ctx) : undefined;
    if (auto) {
      const covered = outputsOf(row, ctx).find(
        (item) => shortage(item) > FLOW_EPSILON,
      );
      current = covered
        ? rowForOutput(row, ctx, covered, shortage(covered))
        : auto.build(0);
    }
    try {
      mergeFlows(above, rowFlows(current, ctx));
    } catch {
      // An invalid row is reported by the caller's evaluation.
    }
    return current;
  });
  return { rows: sized, status: 'ok' };
};

const outputsOf = (row: Row, ctx: CalcContext): string[] => {
  if (row.kind === 'workshop' || row.kind === 'plant')
    return [...perCopy(row, ctx).items]
      .filter(([, v]) => v > FLOW_EPSILON)
      .map(([item]) => item);
  if (row.kind === 'recipe')
    return (ctx.recipe(row.recipe)?.outputs ?? []).map((o) => o.item);
  return row.kind === 'extractor' ? [row.resource] : [];
};

export const solve = (
  mode: SolverMode,
  rows: Row[],
  ctx: CalcContext,
  goals: Goal[],
  isAuto: (row: Row) => boolean,
): Solution =>
  mode === 'sequential'
    ? solveSequential(rows, ctx, goals, isAuto)
    : solveRows(rows, ctx, goals, isAuto);

/**
 * The row with building counts set to produce `perMinute` of `item`, keeping
 * its clock and Somersloop setup. Rows that cannot be resized are returned as is.
 */
export const rowForOutput = (
  row: Row,
  ctx: CalcContext,
  item: string,
  perMinute: number,
): Row => {
  if (row.kind === 'recipe') {
    const recipe = ctx.recipe(row.recipe);
    const building = recipe && ctx.building(recipe.building);
    if (!recipe || !building) return row;
    const { clock, amplified, somersloops } = setup(row.groups);
    const groups = groupsForTarget(
      recipe,
      building,
      item,
      perMinute,
      clock,
      amplified,
      somersloops,
    ).flatMap((g) => {
      if (g.somersloops > 0) return [wholeBoosted(g)];
      const limit = pinnedLimit(row, ctx, clock);
      const sized = plainGroup(
        row,
        ctx,
        limit === undefined ? g.count : Math.min(g.count, limit),
        clock,
      );
      return sized.count > 0 ? [sized] : [];
    });
    return {
      ...row,
      groups:
        groups.length > 0 ? groups : [{ count: 0, clock, somersloops: 0 }],
    };
  }
  if (row.kind === 'workshop' || row.kind === 'plant') {
    const each = perCopy(row, ctx).items.get(item) ?? 0;
    return each > FLOW_EPSILON
      ? { ...row, copies: wholeCopies(perMinute / each) }
      : row;
  }
  if (row.kind === 'extractor') {
    const extraction = ctx.building(row.building)?.extraction;
    if (!extraction) return row;
    const { clock } = setup(row.groups);
    const perBuilding =
      ((extraction.amountPerCycle * 60) / extraction.cycleSeconds) *
      PURITY[row.purity] *
      clock;
    const limit = pinnedLimit(row, ctx, clock);
    const equivalent = perMinute / perBuilding;
    return {
      ...row,
      groups: [
        plainGroup(
          row,
          ctx,
          limit === undefined ? equivalent : Math.min(equivalent, limit),
          clock,
        ),
      ],
    };
  }
  return row;
};

/** Net flows of one copy of a workshop or plant; none when it cannot be read. */
const perCopy = (
  row: Extract<Row, { kind: 'workshop' | 'plant' }>,
  ctx: CalcContext,
): Flows => {
  try {
    return rowFlows({ ...row, copies: 1 }, ctx);
  } catch {
    return emptyFlows();
  }
};
