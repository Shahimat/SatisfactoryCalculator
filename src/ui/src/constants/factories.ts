import { Factory } from 'src/classes';
import { power } from './items';

export const factories = {
  constructor: new Factory('constructor', power.with(4)),
  smelter: new Factory('smelter', power.with(4)),
};
