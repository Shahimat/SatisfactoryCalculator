import { Expression } from './expression';
import { Stream } from './stream';
import { StreamSet } from './stream-set';

export class Factory {
  public static copy(factory: Factory): Factory {
    return new Factory(
      factory.name,
      factory.initialPower,
      factory.powerFactor,
      factory.craftSpeed,
    );
  }

  private _clockSpeed: number = 100;
  constructor(
    public readonly name: string,
    public readonly initialPower: Stream<'MW'>,
    public readonly powerFactor: (clockSpeed: number) => number = (
      clockSpeed: number,
    ) => (clockSpeed < 0 ? 0 : Math.pow(clockSpeed / 100, 1.321928)),
    public readonly craftSpeed: (clockSpeed: number) => number = (
      clockSpeed,
    ) => {
      if (clockSpeed >= 0 && clockSpeed <= 250) {
        return clockSpeed / 100;
      } else if (clockSpeed < 0) {
        return 0;
      } else {
        return 2.5;
      }
    },
  ) {}

  /**
   * @param clockSpeed 0..100..250 (%)
   * @returns
   */
  public setProductivity(clockSpeed: number) {
    this._clockSpeed = clockSpeed;
    return this;
  }

  public get clockSpeed() {
    return this._clockSpeed;
  }

  public set clockSpeed(value: number) {
    this.setProductivity(value);
  }

  public get debug() {
    return {
      type: 'Factory',
      name: this.name,
      initialPower: this.initialPower.debug,
      clockSpeed: this._clockSpeed,
    };
  }

  public readonly getFactoryPower = Expression.build(() =>
    Expression.prod(
      new StreamSet(this.initialPower).rev(),
      this.powerFactor(this.clockSpeed),
    ),
  );

  public readonly getCraftProduction = Expression.build(
    (recipeSet: StreamSet) =>
      Expression.prod(recipeSet, this.craftSpeed(this._clockSpeed)),
  );
}
