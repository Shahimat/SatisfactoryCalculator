import { Stream } from './Stream';

export class Factory {
  public static power(factory: Factory, factoryIndex: number): Stream<'MW'> {
    if (factoryIndex <= 0) {
      return new Stream('power', 'MW', 0);
    } else {
      const intFactoryIndex = Math.trunc(factoryIndex);
      const power = factory.power.prod(intFactoryIndex);
      if (factoryIndex - intFactoryIndex > 0) {
        const clockedSpeedFactory = Factory.copy(factory);
        clockedSpeedFactory.setProductivity(
          (factoryIndex - intFactoryIndex) * 100,
        );
        power.sum(clockedSpeedFactory.power);
      }
      return power;
    }
  }

  public static copy(factory: Factory): Factory {
    return new Factory(
      factory.name,
      factory.initialPower,
      factory.powerFactor,
      factory.craftSpeed,
    );
  }

  private _power: Stream<'MW'>;
  private _clockSpeed: number = 100;
  constructor(
    public readonly name: string,
    public readonly initialPower: Stream<'MW'>,
    public readonly powerFactor: (clockSpeed: number) => number = (
      clockSpeed: number,
    ) => Math.pow(clockSpeed / 100, 1.321928),
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
  ) {
    this._power = initialPower;
  }

  /**
   * @param clockSpeed 0..100..250 (%)
   * @returns
   */
  public setProductivity(clockSpeed: number) {
    this._power = Stream.copy(this.initialPower).prod(
      this.powerFactor(clockSpeed),
    );
    this._clockSpeed = clockSpeed;
    return this;
  }

  public get power() {
    return Stream.copy(this._power);
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
      content: {
        name: this.name,
        initialPower: this.initialPower.debug,
        power: this._power.debug,
      },
    };
  }
}
