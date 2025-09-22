import type { StreamMeasureType } from 'src/types/measure';

export type StreamDebugType<TMeasure = StreamMeasureType> = {
  type: 'Stream';
  name: string;
  measure: TMeasure;
  value: number;
};

export class Stream<TMeasure = StreamMeasureType> {
  static from(name: string, measure: StreamMeasureType, value?: number) {
    return new Stream(name, measure, value);
  }

  static key(name: string, measure: StreamMeasureType) {
    return `${name}:${measure}`;
  }

  static copy<TMeasure = StreamMeasureType>(stream: Stream<TMeasure>) {
    return new Stream<TMeasure>(stream.name, stream.measure, stream.value);
  }

  public value: number;
  constructor(
    public readonly name: string,
    public readonly measure: TMeasure,
    value?: number | null,
  ) {
    this.value = value ?? 0;
  }

  get key() {
    return Stream.key(this.name, this.measure as StreamMeasureType);
  }

  public like(stream: Stream): boolean {
    return this.key === stream.key;
  }

  public sum(stream: Stream) {
    if (this.like(stream)) {
      this.value += stream.value;
    }
    return this;
  }

  public diff(stream: Stream) {
    if (this.like(stream)) {
      this.value -= stream.value;
    }
    return this;
  }

  public prod(factor: number) {
    this.value *= factor;
    return this;
  }

  public rev() {
    this.value *= -1;
    return this;
  }

  public get debug(): StreamDebugType<TMeasure> {
    return {
      type: 'Stream',
      name: this.name,
      measure: this.measure,
      value: this.value,
    };
  }
}
