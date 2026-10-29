import { amplification } from './power';
import type {
  BuildingGroup,
  BuildingSpec,
  Flows,
  ItemSpec,
  RecipeSpec,
} from './types';

/** Flows below this, per minute, are rounding noise of fractional buildings, not a balance. */
export const FLOW_EPSILON = 1e-4;

export type BalanceStatus = 'target' | 'surplus' | 'raw' | 'deficit';

export type BalanceEntry = {
  item: string;
  perMinute: number;
  status: BalanceStatus;
};

/**
 * Net flow per item: targets and surpluses are produced, raw resources and
 * deficits are consumed — a consumed raw resource has to be extracted.
 */
export const balance = (
  flows: Flows,
  targets: string[],
  item: (id: string) => ItemSpec | undefined,
): BalanceEntry[] =>
  [...flows.items]
    .filter(([, perMinute]) => Math.abs(perMinute) > FLOW_EPSILON)
    .map(([id, perMinute]): BalanceEntry => {
      if (perMinute > 0) {
        return {
          item: id,
          perMinute,
          status: targets.includes(id) ? 'target' : 'surplus',
        };
      }
      return {
        item: id,
        perMinute,
        status: item(id)?.kind === 'resource' ? 'raw' : 'deficit',
      };
    })
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        b.perMinute - a.perMinute,
    );

const STATUS_ORDER: Record<BalanceStatus, number> = {
  target: 0,
  surplus: 1,
  raw: 2,
  deficit: 3,
};

/** Output of one building at 100% clock without Somersloops, per minute. */
export const baseOutputPerMinute = (
  recipe: RecipeSpec,
  item: string,
): number => {
  const output = recipe.outputs.find((o) => o.item === item);
  if (!output) throw new Error(`${recipe.id} does not produce ${item}`);
  return (output.amount * 60) / recipe.cycleSeconds;
};

/**
 * Building groups that produce `perMinute` of `item`: `amplified` buildings get
 * `somersloops` slots filled, the rest run plain. Plain buildings may be fractional.
 */
export const groupsForTarget = (
  recipe: RecipeSpec,
  building: BuildingSpec,
  item: string,
  perMinute: number,
  clock: number,
  amplified: number,
  somersloops: number,
): BuildingGroup[] => {
  const perBuilding = baseOutputPerMinute(recipe, item) * clock;
  const boost = amplification(somersloops, building.somersloopSlots);
  const boostedBuildings = Math.min(
    amplified,
    perMinute / (perBuilding * boost),
  );
  const rest = perMinute - boostedBuildings * perBuilding * boost;
  const plain = Math.max(0, rest / perBuilding);
  return [
    { count: round(plain), clock, somersloops: 0 },
    { count: round(boostedBuildings), clock, somersloops },
  ].filter((group) => group.count > 0);
};

const round = (value: number): number => Math.round(value * 1e6) / 1e6;

/** How many belts or pipes of the given capacity carry the flow. */
export const carriers = (
  perMinute: number,
  capacityPerMinute: number,
): number => Math.abs(perMinute) / capacityPerMinute;

/** Stable fingerprint of what a recipe does; it changes when the game changes the recipe. */
export const recipeSignature = (recipe: RecipeSpec): string =>
  JSON.stringify([
    recipe.building,
    recipe.cycleSeconds,
    recipe.inputs.map(({ item, amount }) => [item, amount]),
    recipe.outputs.map(({ item, amount }) => [item, amount]),
    recipe.variablePowerMW ?? null,
  ]);

export type RecipeChange = { recipe: string; status: 'changed' | 'removed' };

/** Compares recipe signatures saved with a calculation against the current game data. */
export const recipeChanges = (
  saved: Record<string, string>,
  recipe: (id: string) => RecipeSpec | undefined,
): RecipeChange[] =>
  Object.entries(saved).flatMap(([id, signature]): RecipeChange[] => {
    const current = recipe(id);
    if (!current) return [{ recipe: id, status: 'removed' }];
    return recipeSignature(current) === signature
      ? []
      : [{ recipe: id, status: 'changed' }];
  });
