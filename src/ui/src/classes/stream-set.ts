import { Stream, type StreamDebugType } from './stream';

export type StreamSetDebugType = {
  type: 'StreamSet';
  set: StreamDebugType[];
};

export class StreamSet {
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

  public add(...streams: Stream[]) {
    for (const stream of streams) {
      const existsStream = this.map.get(stream.key);
      if (existsStream) {
        this.map.set(stream.key, existsStream.sum(stream));
      } else {
        this.map.set(stream.key, stream);
      }
    }
    return this;
  }

  public sum(streamSet: StreamSet) {
    streamSet.map.forEach((stream, key) => {
      const existsStream = this.map.get(stream.key);
      if (existsStream) {
        this.map.set(key, existsStream.sum(stream));
      } else {
        this.map.set(key, stream);
      }
    });
    return this;
  }

  public diff(streamSet: StreamSet) {
    streamSet.map.forEach((stream, key) => {
      const existsStream = this.map.get(stream.key);
      if (existsStream) {
        this.map.set(key, existsStream.diff(stream));
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

  public value(stream: Stream) {
    return this.map.get(stream.key)?.value ?? 0;
  }

  public get debug(): StreamSetDebugType {
    return {
      type: 'StreamSet',
      set: [...this.map.values()].map((stream) => stream.debug),
    };
  }
}
