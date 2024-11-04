import { StreamMeasureType } from './measure';
import { RestrictionType } from './restriction';

export type StreamType = [string, StreamMeasureType, number];

type FactoryType = {
  initialPower: number;
};

type RecipeType = {
  factory: string;
  content: StreamType[];
};

export type FormulaType =
  | {
      restriction?: RestrictionType;
      recipe: string;
      streamName: string;
    }
  | FormulaType[];

export type ConfigType = {
  factories: {
    [index: string]: FactoryType;
  };
  recipes: {
    [index: string]: RecipeType;
  };
};
