import { ConfigType, FormulaType } from 'src/types/configuration';
import { streamMeasures, StreamMeasureType } from 'src/types/measure';
import { restrictions } from 'src/types/restriction';
import { Validation } from 'src/utils/validation';

import { Factory } from './Factory';
import { Formula } from './Formula';
import { Recipe } from './Recipe';
import { Stream } from './Stream';
import { StreamSet } from './StreamSet';

export class Engine {
  private static validationScheme = (
    factoriesNames?: string[],
    recipesNames?: string[],
  ) => ({
    type: 'object',
    properties: {
      factories: {
        type: 'object',
        ...(factoriesNames
          ? {
              propertyNames: {
                enum: [...factoriesNames],
              },
            }
          : {}),
        additionalProperties: {
          type: 'object',
          properties: {
            initialPower: { type: 'number' },
          },
          required: ['initialPower'],
          additionalProperties: false,
        },
      },
      recipes: {
        type: 'object',
        ...(recipesNames
          ? {
              propertyNames: {
                enum: [...recipesNames],
              },
            }
          : {}),
        additionalProperties: {
          type: 'object',
          properties: {
            factory: {
              type: 'string',
              ...(factoriesNames
                ? {
                    enum: [...factoriesNames],
                  }
                : {}),
            },
            content: {
              type: 'array',
              items: {
                type: 'array',
                items: [
                  {
                    type: 'string',
                  },
                  { type: 'string', enum: [...streamMeasures] },
                  { type: 'number' },
                ],
                minItems: 3,
                maxItems: 3,
              },
            },
          },
          required: ['factory', 'content'],
          additionalProperties: false,
        },
      },
    },
    required: ['factories', 'recipes'],
    additionalProperties: false,
  });

  public static formulaValidationScheme = (
    recipesNames?: string[],
    itemsNames?: string[],
  ) => ({
    $id: 'http://example.com/schemas/formula.json',
    definitions: {
      formula: {
        type: 'object',
        properties: {
          restriction: {
            type: 'string',
            enum: [...restrictions],
          },
          recipe: {
            type: 'string',
            ...(recipesNames ? { enum: [...recipesNames] } : {}),
          },
          streamName: {
            type: 'string',
            ...(itemsNames ? { enum: [...itemsNames] } : {}),
          },
        },
        required: ['recipe', 'streamName'],
        additionalProperties: false,
      },
      complexFormula: {
        anyOf: [
          {
            type: 'array',
            items: { $ref: '#/definitions/complexFormula' },
            minItems: 0,
          },
          {
            $ref: '#/definitions/formula',
          },
        ],
      },
    },
    type: 'object',
    additionalProperties: {
      $ref: '#/definitions/complexFormula',
    },
  });

  public static validate: (input: ConfigType) => true | Error = (input) => {
    const firstValidate = Validation.isValid(input, Engine.validationScheme());
    if (firstValidate instanceof Error) {
      return firstValidate;
    } else {
      const factoriesNames = Object.keys(input.factories);
      const recipesNames = Object.keys(input.recipes);
      return Validation.isValid(
        input,
        Engine.validationScheme(factoriesNames, recipesNames),
      );
    }
  };

  public static from(cfg: ConfigType): Engine | Error {
    const validate = Engine.validate(cfg);
    if (validate instanceof Error) {
      return validate;
    } else {
      const factories = new Map(
        Object.entries(cfg.factories).map(([name, factory]) => [
          name,
          new Factory(name, new Stream('power', 'MW', factory.initialPower)),
        ]),
      );
      const recipes = new Map(
        Object.entries(cfg.recipes).map(([name, recipe]) => [
          name,
          new Recipe(
            name,
            factories.get(recipe.factory)!,
            ...recipe.content.map((stream) => Stream.from(stream)),
          ),
        ]),
      );
      const items = new Map(
        Object.values(cfg.recipes).flatMap(({ content }) =>
          content.map(([name, measure]) => [name, measure]),
        ),
      );
      return new Engine(factories, recipes, items);
    }
  }

  public readonly formulaValidation: (
    input: Record<string, FormulaType>,
  ) => true | Error;
  constructor(
    public readonly factories: Map<string, Factory>,
    public readonly recipes: Map<string, Recipe>,
    public readonly items: Map<string, StreamMeasureType>,
    public readonly formulas: Map<string, Formula> = new Map(),
  ) {
    this.formulaValidation = Validation.buildIsValidFunction<
      Record<string, FormulaType>
    >(Engine.formulaValidationScheme([...recipes.keys()], [...items.keys()]));
  }

  public set(formulas: Record<string, FormulaType>): Error | null {
    const validation = this.formulaValidation(formulas);
    if (validation instanceof Error) {
      return validation;
    } else {
      const errors: Error[] = [];
      Object.entries(formulas).forEach(([name, formula]) => {
        const resultFormula = this.buildFormula(formula);
        if (resultFormula instanceof Error) {
          errors.push(resultFormula);
        } else {
          this.formulas.set(name, resultFormula);
        }
      });
      return errors.length === 0
        ? null
        : new Error(errors.map((error) => error.message).join('; '));
    }
  }

  public clear() {
    this.formulas.clear();
  }

  public solve(name: string, ...input: [string, number][]) {
    const errors: Error[] = [];
    if (this.formulas.has(name)) {
      const streams = input
        .map(([name, value]) => {
          const measure = this.items.get(name);
          if (measure) {
            return new Stream(name, measure, value);
          } else {
            errors.push(new Error(`measure for item "${name}" not founded`));
            return null;
          }
        })
        .filter((item): item is Stream => item !== null);
      if (errors.length > 0) {
        return {
          result: [],
          error: new Error(errors.map((err) => err.message).join('; ')),
        };
      }
      const inputSet = new StreamSet(...streams);
      return {
        result: this.formulas.get(name)!.solve(inputSet),
      };
    } else {
      return {
        result: [],
        error: new Error(`formula by name "${name}" not founded`),
      };
    }
  }

  public solveDebug(name: string, ...input: [string, number][]) {
    const errors: Error[] = [];
    if (this.formulas.has(name)) {
      const streams = input
        .map(([name, value]) => {
          const measure = this.items.get(name);
          if (measure) {
            return new Stream(name, measure, value);
          } else {
            errors.push(new Error(`measure for item "${name}" not founded`));
            return null;
          }
        })
        .filter((item): item is Stream => item !== null);
      if (errors.length > 0) {
        return {
          result: [],
          error: new Error(errors.map((err) => err.message).join('; ')),
        };
      }
      const inputSet = new StreamSet(...streams);
      return {
        result: this.formulas.get(name)!.solveDebug(inputSet),
      };
    } else {
      return {
        result: [],
        error: new Error(`formula by name "${name}" not founded`),
      };
    }
  }

  private buildFormula(formula: FormulaType): Formula | Error {
    if (Array.isArray(formula)) {
      const [first, ...formulas] = formula.map((item) =>
        this.buildFormula(item),
      );
      if (!first) {
        return new Error('formula not found');
      } else if (first instanceof Error) {
        return first;
      }
      for (const item of formulas) {
        if (item instanceof Error) {
          return item;
        }
        first.next(item);
      }
      return first;
    } else {
      const recipe = this.recipes.get(formula.recipe);
      const measure = this.items.get(formula.streamName);
      if (!recipe) {
        return new Error(`recipe by name "${formula.recipe}" not founded`);
      } else if (!measure) {
        return new Error(
          `measure by item name "${formula.streamName}" not founded`,
        );
      } else {
        return new Formula(recipe, formula.restriction ?? 'eq', [
          formula.streamName,
          measure,
        ]);
      }
    }
  }
}
