import { StreamMeasureType } from 'src/types/measure';

export class Stream {
  static key(name: string, measure: StreamMeasureType) {
    return `${measure}:${name}`;
  }

  static copy(stream: Stream) {
    return new Stream(stream.name, stream.measure, stream.value);
  }

  public value: number;
  constructor(
    public readonly name: string,
    public readonly measure: StreamMeasureType,
    value: number | null,
  ) {
    this.value = value ?? 0;
  }

  get key() {
    return Stream.key(this.name, this.measure);
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
}
