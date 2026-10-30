import catalogJson from '@catalog';

import { compareNames, localName } from './i18n';
import type {
  Catalog,
  CatalogBuilding,
  CatalogItem,
  CatalogRecipe,
} from '../../data/src/catalog.types.ts';

export type { Catalog, CatalogBuilding, CatalogItem, CatalogRecipe };

export const catalog: Catalog = catalogJson;

const index = <T extends { id: string }>(list: T[]): Map<string, T> =>
  new Map(list.map((entry) => [entry.id, entry]));

export const items = index(catalog.items);
export const buildings = index(catalog.buildings);
export const recipes = index(catalog.recipes);

export const recipesByOutput = new Map<string, CatalogRecipe[]>();
for (const recipe of catalog.recipes) {
  for (const { item } of recipe.outputs) {
    const list = recipesByOutput.get(item) ?? [];
    list.push(recipe);
    recipesByOutput.set(item, list);
  }
}
for (const list of recipesByOutput.values()) {
  list.sort((a, b) => Number(a.alternate) - Number(b.alternate));
}

const producible = catalog.items.filter((item) => recipesByOutput.has(item.id));

/** Items that some recipe produces, sorted by name in the current language for pickers. */
export const producibleItems = (): CatalogItem[] =>
  [...producible].sort(compareNames);

export const DEFAULT_ITEM = items.has('Desc_IronPlate_C')
  ? 'Desc_IronPlate_C'
  : (producible[0]?.id ?? '');

/** Icons for interface anchors, fetched with the catalog icons. */
export const SOMERSLOOP_ICON = 'Desc_WAT1_C';
export const POWER_SHARD_ICON = 'Desc_CrystalShard_C';

export const iconUrl = (id: string): string =>
  `${import.meta.env.ASSET_PREFIX}/icons/${id}.png`;

export const itemName = (id: string): string => {
  const item = items.get(id);
  return item ? localName(item) : id;
};

export const recipeName = (id: string): string => {
  const recipe = recipes.get(id);
  return recipe ? localName(recipe) : id;
};

export const buildingName = (id: string): string => {
  const building = buildings.get(id);
  return building ? localName(building) : id;
};

export const isFluid = (id: string): boolean => {
  const form = items.get(id)?.form;
  return form === 'liquid' || form === 'gas';
};
