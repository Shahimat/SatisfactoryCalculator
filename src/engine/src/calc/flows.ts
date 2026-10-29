import { amplification, basePowerMW, groupPowerMW } from './power';
import type {
  BuildingGroup,
  CalcContext,
  ExtractorRow,
  Flows,
  GeneratorRow,
  Purity,
  RecipeRow,
  Row,
} from './types';

export const PURITY: Record<Purity, number> = {
  impure: 0.5,
  normal: 1,
  pure: 2,
};

const SECONDS_PER_MINUTE = 60;

export const emptyFlows = (): Flows => ({
  items: new Map(),
  powerMW: 0,
  generationMW: 0,
  buildings: 0,
  somersloops: 0,
});

const addItem = (flows: Flows, item: string, perMinute: number): void => {
  flows.items.set(item, (flows.items.get(item) ?? 0) + perMinute);
};

/** Adds `source` scaled by `factor` into `target`. */
export const mergeFlows = (target: Flows, source: Flows, factor = 1): Flows => {
  for (const [item, perMinute] of source.items)
    addItem(target, item, perMinute * factor);
  target.powerMW += source.powerMW * factor;
  target.generationMW += source.generationMW * factor;
  target.buildings += source.buildings * factor;
  target.somersloops += source.somersloops * factor;
  return target;
};

/** Building-equivalents running at 100%: what the group produces relative to one building. */
const runningShare = (group: BuildingGroup): number =>
  group.count * group.clock;

const groupsOf = (row: { groups: BuildingGroup[] }): BuildingGroup[] =>
  row.groups.filter((group) => group.count > 0);

const countBuildings = (flows: Flows, groups: BuildingGroup[]): void => {
  for (const group of groups) {
    flows.buildings += Math.ceil(group.count);
    flows.somersloops += Math.ceil(group.count) * group.somersloops;
  }
};

export const recipeRowFlows = (row: RecipeRow, ctx: CalcContext): Flows => {
  const recipe = ctx.recipe(row.recipe);
  if (!recipe) throw new Error(`Unknown recipe ${row.recipe}`);
  const building = ctx.building(recipe.building);
  if (!building) throw new Error(`Unknown building ${recipe.building}`);
  const flows = emptyFlows();
  const cyclesPerMinute = SECONDS_PER_MINUTE / recipe.cycleSeconds;
  const base = basePowerMW(building, recipe);
  for (const group of groupsOf(row)) {
    const share = runningShare(group);
    const amplified = amplification(
      group.somersloops,
      building.somersloopSlots,
    );
    for (const { item, amount } of recipe.inputs) {
      addItem(flows, item, -amount * cyclesPerMinute * share);
    }
    for (const { item, amount } of recipe.outputs) {
      addItem(flows, item, amount * cyclesPerMinute * share * amplified);
    }
    flows.powerMW -= groupPowerMW(base, building, group);
  }
  countBuildings(flows, groupsOf(row));
  return flows;
};

export const extractorRowFlows = (
  row: ExtractorRow,
  ctx: CalcContext,
): Flows => {
  const building = ctx.building(row.building);
  if (!building?.extraction)
    throw new Error(`Unknown extractor ${row.building}`);
  const { cycleSeconds, amountPerCycle } = building.extraction;
  const flows = emptyFlows();
  for (const group of groupsOf(row)) {
    const perMinute =
      (amountPerCycle *
        SECONDS_PER_MINUTE *
        PURITY[row.purity] *
        runningShare(group)) /
      cycleSeconds;
    addItem(flows, row.resource, perMinute);
    flows.powerMW -= groupPowerMW(building.powerMW, building, group);
  }
  countBuildings(flows, groupsOf(row));
  return flows;
};

/** Generators scale power and fuel linearly with clock. */
export const generatorRowFlows = (
  row: GeneratorRow,
  ctx: CalcContext,
): Flows => {
  const building = ctx.building(row.building);
  if (!building?.generation)
    throw new Error(`Unknown generator ${row.building}`);
  const fuelSpec = building.generation.fuels.find(
    (fuel) => fuel.item === row.fuel,
  );
  const fuelItem = ctx.item(row.fuel);
  if (!fuelSpec || !fuelItem)
    throw new Error(`${row.building} cannot burn ${row.fuel}`);
  const flows = emptyFlows();
  for (const group of groupsOf(row)) {
    const powerMW = building.generation.powerMW * runningShare(group);
    const fuelPerMinute = (powerMW / fuelItem.energyMJ) * SECONDS_PER_MINUTE;
    addItem(flows, row.fuel, -fuelPerMinute);
    if (fuelSpec.supplement) {
      addItem(
        flows,
        fuelSpec.supplement,
        -powerMW * building.generation.supplementM3PerMJ * SECONDS_PER_MINUTE,
      );
    }
    if (fuelSpec.byproduct) {
      addItem(
        flows,
        fuelSpec.byproduct.item,
        fuelPerMinute * fuelSpec.byproduct.amount,
      );
    }
    flows.powerMW += powerMW;
    flows.generationMW += powerMW;
  }
  countBuildings(flows, groupsOf(row));
  return flows;
};

/**
 * Sums rows, expanding workshops and plants. A workshop or plant that refers
 * back to itself through its rows is reported instead of recursing forever.
 */
export const rowsFlows = (
  rows: Row[],
  ctx: CalcContext,
  path: string[] = [],
): Flows => {
  const total = emptyFlows();
  for (const row of rows) mergeFlows(total, rowFlows(row, ctx, path));
  return total;
};

export const rowFlows = (
  row: Row,
  ctx: CalcContext,
  path: string[] = [],
): Flows => {
  switch (row.kind) {
    case 'recipe': {
      return recipeRowFlows(row, ctx);
    }
    case 'extractor': {
      return extractorRowFlows(row, ctx);
    }
    case 'generator': {
      return generatorRowFlows(row, ctx);
    }
    case 'workshop': {
      return nested(
        `workshop:${row.workshop}`,
        ctx.workshopRows(row.workshop),
        row.copies,
      );
    }
    case 'plant': {
      return nested(
        `plant:${row.calculation}`,
        ctx.calculationRows(row.calculation),
        row.copies,
      );
    }
  }

  function nested(key: string, rows: Row[] | undefined, copies: number): Flows {
    if (!rows) throw new Error(`Unknown ${key}`);
    if (path.includes(key))
      throw new Error(`Cyclic reference: ${[...path, key].join(' → ')}`);
    return mergeFlows(
      emptyFlows(),
      rowsFlows(rows, ctx, [...path, key]),
      copies,
    );
  }
};
