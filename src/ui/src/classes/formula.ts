import { Recipe } from './recipe';
import { Stream } from './stream';
import { StreamSet } from './stream-set';
import {
  Expression,
  type ContextType,
  type ExpressionFunction,
} from './expression';

export class Formula {
  constructor(
    private readonly chains: ExpressionFunction<
      [StreamSet, ContextType],
      StreamSet
    >[] = [],
  ) {}

  public solve(context: ContextType, ...streams: Stream[]): StreamSet | Error {
    try {
      let result = new StreamSet(...streams);
      context.clear();
      for (const chain of this.chains) {
        result = chain(result, context);
      }
      return result;
    } catch (err) {
      console.error(err);
      return err as Error;
    }
  }

  public fullDepletion(recipe: Recipe, target: Stream): Formula {
    const production = recipe.production.rev();
    this.chains.push(
      Expression.build<[StreamSet, ContextType], StreamSet>((input, context) =>
        Expression.sum(
          input,
          Expression.prod(
            production,
            Expression.custom<[], number>(() => {
              const targetStreamValue = input.value(target);
              const recipeTargetStreamValue = production.value(target);
              if (
                (targetStreamValue >= 0 && recipeTargetStreamValue < 0) ||
                (targetStreamValue <= 0 && recipeTargetStreamValue > 0)
              ) {
                const factoryIndex = Math.abs(
                  targetStreamValue / recipeTargetStreamValue,
                );
                context.set(target.key, factoryIndex);
                return factoryIndex;
              }
              throw new Error('recipe not found');
            }),
          ),
        ),
      ),
    );
    return this;
  }
}
