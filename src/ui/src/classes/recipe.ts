import { Expression } from './expression';
import { Factory } from './factory';
import { Stream } from './stream';
import { StreamSet } from './stream-set';

export class Recipe {
  public static copy(recipe: Recipe) {
    return new Recipe(
      recipe.name,
      Factory.copy(recipe._factory),
      StreamSet.copy(recipe._streamSet),
    );
  }

  public static from(name: string, factory: Factory, ...streams: Stream[]) {
    return new Recipe(name, factory, new StreamSet(...streams));
  }

  constructor(
    public readonly name: string,
    private readonly _factory: Factory,
    private readonly _streamSet: StreamSet,
  ) {}

  public get debug() {
    return {
      type: 'Recipe',
      name: this.name,
      factory: this._factory.debug,
      streamSet: this._streamSet.debug,
    };
  }

  public get baseProduction() {
    return StreamSet.copy(this._streamSet);
  }

  public get factory() {
    return Factory.copy(this._factory);
  }

  public get production() {
    return Expression.sum(
      this._factory.getCraftProduction(this.baseProduction),
      this._factory.getFactoryPower(),
    );
  }

  public withProductivity(clockSpeed: number) {
    const recipe = Recipe.copy(this);
    recipe._factory.setProductivity(clockSpeed);
    return recipe;
  }
}
