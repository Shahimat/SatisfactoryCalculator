import { Recipe } from 'src/classes';
import { factories } from './factories';
import { items } from './items';

export const recipes = {
  ironPlate: Recipe.from(
    'IronPlate',
    factories.constructor,
    items.iron_ingot.with(-30),
    items.iron_plate.with(20),
  ),
  ironIngot: Recipe.from(
    'IronIngot',
    factories.smelter,
    items.iron_ore.with(-30),
    items.iron_ingot.with(30),
  ),
} as const;

export type RecipeName = keyof typeof recipes;

export const recipesDictionary = Object.keys(recipes) as RecipeName[];
