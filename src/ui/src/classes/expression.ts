import { StreamSet } from './stream-set';

export type ContextType = Map<string, StreamSet | number | null>;

export type ExpressionValue = StreamSet | ContextType | number | null;

export type ExpressionFunction<
  TValue extends ExpressionValue[] = [],
  TResult extends ExpressionValue = null,
> = (...input: TValue) => TResult;

export class Expression {
  public static sum(...input: StreamSet[]): StreamSet {
    const res = new StreamSet();
    for (const elem of input) {
      res.sum(elem);
    }
    return res;
  }

  public static diff(input1: StreamSet, input2: StreamSet): StreamSet {
    return input1.diff(input2);
  }

  public static prod(input: StreamSet, factor: number): StreamSet {
    return input.prod(factor);
  }

  public static custom<
    TValue extends ExpressionValue[] = [],
    TResult extends ExpressionValue = null,
  >(calc: ExpressionFunction<TValue, TResult>, ...input: TValue) {
    return calc(...input);
  }

  public static build<
    TValue extends ExpressionValue[] = [],
    TResult extends ExpressionValue = null,
  >(calc: ExpressionFunction<TValue, TResult>) {
    return (...input: TValue): TResult => {
      try {
        return calc(...input);
      } catch (err) {
        console.error(err);
        return null as TResult;
      }
    };
  }
}
