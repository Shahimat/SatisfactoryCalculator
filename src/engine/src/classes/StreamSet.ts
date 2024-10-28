import { StreamMeasureType } from 'src/types/measure';

import { Stream } from './Stream';

export class StreamSet {
  public static from(...streams: Stream[]) {
    const streamSet = new StreamSet();
    streams.forEach((stream) => {
      if (streamSet.map.has(stream.key)) {
        streamSet.map.set(
          stream.key,
          streamSet.map.get(stream.key)!.sum(stream),
        );
      } else {
        streamSet.map.set(stream.key, stream);
      }
    });
  }

  public static copy(streamSet: StreamSet) {
    return new StreamSet(
      ...[...streamSet.map.values()].map((stream) => Stream.copy(stream)),
    );
  }

  public readonly map: Map<string, Stream> = new Map();

  constructor(...streams: Stream[]) {
    streams.forEach((stream) => {
      this.map.set(stream.key, stream);
    });
  }

  public add(stream: Stream) {
    if (this.map.has(stream.key)) {
      this.map.set(stream.key, this.map.get(stream.key)!.sum(stream));
    } else {
      this.map.set(stream.key, stream);
    }
    return this;
  }

  public sum(streamSet: StreamSet) {
    streamSet.map.forEach((stream, key) => {
      if (this.map.has(key)) {
        this.map.set(key, this.map.get(key)!.sum(stream));
      } else {
        this.map.set(key, stream);
      }
    });
    return this;
  }

  public diff(streamSet: StreamSet) {
    streamSet.map.forEach((stream, key) => {
      if (this.map.has(key)) {
        this.map.set(key, this.map.get(key)!.diff(stream));
      } else {
        this.map.set(key, stream.rev());
      }
    });
    return this;
  }

  public prod(factor: number) {
    this.map.forEach((stream, key) => {
      this.map.set(key, stream.prod(factor));
    });
    return this;
  }

  public rev() {
    this.map.forEach((stream, key) => {
      this.map.set(key, stream.rev());
    });
    return this;
  }

  public ratio(stream: Stream) {
    if (this.map.has(stream.key)) {
      return Math.abs(stream.value) / Math.abs(this.map.get(stream.key)!.value);
    } else {
      return 0;
    }
  }

  public find(name: string, measure: StreamMeasureType) {
    const find = this.map.get(Stream.key(name, measure));
    return find ? Stream.copy(find) : null;
  }

  public applyRecipe(
    name: string,
    measure: StreamMeasureType,
    recipe: StreamSet,
  ) {
    const target = this.find(name, measure);
    const recipeTarget = recipe.find(name, measure);
    if (target && recipeTarget && recipeTarget.value > 0) {
      this.sum(StreamSet.copy(recipe).prod(recipe.ratio(target)));
    }
    return this;
  }

  public get debug() {
    return {
      type: 'StreamSet',
      content: [...this.map.values()].map((stream) => stream.debug),
    };
  }
}
