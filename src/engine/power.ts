import type { BuildingGroup, BuildingSpec, RecipeSpec } from './types';

/** Output multiplier of a building: each filled slot adds an equal share, all slots double it. */
export const amplification = (somersloops: number, slots: number): number =>
  slots > 0 ? 1 + Math.min(somersloops, slots) / slots : 1;

/** Average base power of a building running the recipe, before clock and Somersloops. */
export const basePowerMW = (
  building: BuildingSpec,
  recipe?: RecipeSpec,
): number =>
  recipe?.variablePowerMW
    ? recipe.variablePowerMW.constant + recipe.variablePowerMW.factor / 2
    : building.powerMW;

/** Power of one building: base × amplification^exp × clock^exp. */
export const buildingPowerMW = (
  base: number,
  building: BuildingSpec,
  clock: number,
  somersloops: number,
): number =>
  base *
  amplification(somersloops, building.somersloopSlots) **
    building.somersloopPowerExponent *
  clock ** building.powerExponent;

/**
 * Power of a group: whole buildings at the group clock plus the fractional
 * building underclocked by the remaining fraction.
 */
export const groupPowerMW = (
  base: number,
  building: BuildingSpec,
  group: BuildingGroup,
): number => {
  const whole = Math.floor(group.count);
  const fraction = group.count - whole;
  const power =
    whole * buildingPowerMW(base, building, group.clock, group.somersloops);
  return fraction > 0
    ? power +
        buildingPowerMW(
          base,
          building,
          group.clock * fraction,
          group.somersloops,
        )
    : power;
};
