import { StreamMeasureType } from 'src/types/measure';
import { RestrictionType } from 'src/types/restriction';

import { Recipe } from './Recipe';
import { StreamSet } from './StreamSet';

type FormulaFunction = (streamSet: StreamSet) => {
  factoryIndex: number;
  error?: Error;
};

export class Formula {
  public static fromEq(
    recipe: Recipe,
    targetStreamName: string,
    targetStreamMeasure: StreamMeasureType,
  ): Formula {
    return new Formula(recipe, 'eq', [targetStreamName, targetStreamMeasure]);
  }

  private chains: Formula[] = [];
  private variant: FormulaFunction;
  constructor(
    public readonly recipe: Recipe,
    public readonly restriction: RestrictionType,
    public readonly additionalParams: [string, StreamMeasureType],
  ) {
    this.variant = this.setVariant(restriction);
  }

  public solve(streamSet: StreamSet): {
    streamSet: StreamSet;
    recipe: Recipe;
    factoryIndex: number;
  }[] {
    const { factoryIndex } = this.variant(streamSet);
    return [
      {
        streamSet: StreamSet.copy(streamSet),
        recipe: this.recipe,
        factoryIndex,
      },
      ...this.chains.flatMap((chain) => chain.solve(streamSet)),
    ];
  }

  public solveDebug(streamSet: StreamSet) {
    return {
      type: 'SolveDebug',
      input: streamSet.debug,
      output: this.solve(streamSet).map(
        ({ streamSet, recipe, factoryIndex }) => ({
          streamSet: streamSet.debug,
          recipe: recipe.debug,
          factoryIndex,
        }),
      ),
    };
  }

  public next(formulaBuilder: Formula) {
    this.chains = [...this.chains, formulaBuilder];
    return this;
  }

  private setVariant(restriction: RestrictionType): FormulaFunction {
    switch (restriction) {
      case 'eq': {
        return (streamSet: StreamSet) => {
          const [name, measure] = this.additionalParams;
          const target = streamSet.find(name, measure);
          const recipeTarget = this.recipe.streamSet.find(name, measure);
          if (target && recipeTarget) {
            const factoryIndex = this.recipe.streamSet.ratio(target);
            streamSet.sum(
              StreamSet.copy(this.recipe.streamSet).prod(factoryIndex),
            );
            return { factoryIndex };
          } else {
            return {
              factoryIndex: 0,
              error: new Error(`Expected target & recipeTarget but not found`),
            };
          }
        };
      }
      default: {
        return (_streamSet: StreamSet) => ({
          factoryIndex: 0,
          error: new Error('Invalid formula variant'),
        });
      }
    }
  }

  public get debug(): unknown[] {
    return [
      {
        type: 'Formula',
        content: {
          recipe: this.recipe.debug,
          restriction: this.restriction,
          additionalParams: [...this.additionalParams],
        },
      },
      ...this.chains.map((chain) => chain.debug),
    ];
  }
}
