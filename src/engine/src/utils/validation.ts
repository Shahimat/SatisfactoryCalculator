import Ajv, { AnySchema, ErrorObject } from 'ajv';

export class Validation {
  public static ajv = new Ajv();

  public static getError<T = unknown>(
    errors?: ErrorObject<string, Record<string, any>, T>[],
  ): Error {
    return new Error(
      errors
        ? `${errors.length > 0 ? 'multiple errors\n' : ''}${errors
            .map(
              ({ instancePath, schemaPath, params, message }) =>
                `${instancePath} <<${JSON.stringify(params)}>>: ${message ?? ''}. Scheme ${schemaPath}`,
            )
            .join(';\n')}`
        : 'unknown error',
    );
  }

  public static isValid<T = unknown>(
    input: T,
    schema: AnySchema,
  ): true | Error {
    const validateFn = Validation.ajv.compile(schema);
    const result = validateFn(input);
    if (result) {
      return true;
    } else {
      return Validation.getError(validateFn.errors ?? undefined);
    }
  }

  public static buildIsValidFunction<T = unknown>(
    schema: AnySchema,
  ): (input: T) => true | Error {
    const validateFn = Validation.ajv.compile(schema);
    return (input: T) => {
      const result = validateFn(input);
      if (result) {
        return true;
      } else {
        console.log(validateFn.errors);
        return Validation.getError(validateFn.errors ?? undefined);
      }
    };
  }
}
