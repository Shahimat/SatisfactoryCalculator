import { Stream } from 'src/classes';

export const power = new Stream('power', 'MW');

export const items = {
  power,
  iron_ingot: new Stream('iron_ingot', 'ipm'),
  iron_plate: new Stream('iron_plate', 'ipm'),
  iron_ore: new Stream('iron_ore', 'ipm'),
} as const;

export type ItemName = keyof typeof items;

export const itemsDictionary = Object.keys(items) as ItemName[];
