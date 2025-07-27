import { MeasureType } from 'src/types/measure';

export class Unit {
  public static sum(...units: Unit[]): Unit[] {
    return Object.values(
      units.reduce(
        (acc, unit) => {
          let prev = acc[unit.key];
          if (!prev) {
            prev = Unit.assign(unit);
            acc[prev.key] = prev;
          } else {
            prev.value += unit.value;
          }
          return acc;
        },
        {} as { [index: string]: Unit },
      ),
    );
  }

  public static prod(factor: number, ...units: Unit[]): Unit[] {
    return units.map((unit) => {
      const newUnit = Unit.assign(unit);
      unit.value *= factor;
      return newUnit;
    });
  }

  static assign(unit: Unit) {
    return new Unit(unit.name, unit.measure, unit.value);
  }

  private _measure: MeasureType;
  public value: number;
  constructor(
    public readonly name: string,
    measure: MeasureType,
    value: number | null,
  ) {
    this._measure = measure;
    this.value = value ?? 0;
  }

  get measure(): MeasureType {
    return this._measure;
  }

  get perMinute(): number {
    switch (this._measure) {
      case 'items':
      case 'm3':
      case 'MJ':
        return this.value / 60;
      case 'ipm':
      case 'm3pm':
      case 'MW':
        return this.value * 60;
    }
  }

  get key() {
    return `${this.measure}:${this.name}`;
  }

  public like(unit: Unit): boolean {
    return this.key === unit.key;
  }
}
