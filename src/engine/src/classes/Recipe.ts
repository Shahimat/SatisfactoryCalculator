import { Factory } from './Factory';
import { Stream } from './Stream';
import { StreamSet } from './StreamSet';

export class Recipe {
  private _streamSet: StreamSet;
  constructor(
    public readonly name: string,
    public readonly factory: Factory,
    ...streams: Stream[]
  ) {
    this._streamSet = new StreamSet(...streams);
  }

  public get streamSet() {
    return StreamSet.copy(this._streamSet);
  }

  public get debug() {
    return {
      type: 'Recipe',
      content: {
        name: this.name,
        factory: this.factory.debug,
        streamSet: this._streamSet.debug,
      },
    };
  }
}
