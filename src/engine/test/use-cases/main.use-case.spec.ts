import { describe, expect, test } from '@jest/globals';
import Ajv from 'ajv';
import { Engine } from 'src/classes/Engine';
import { Factory } from 'src/classes/Factory';
import { Formula } from 'src/classes/Formula';
import { Recipe } from 'src/classes/Recipe';
import { Stream } from 'src/classes/Stream';
import { StreamSet } from 'src/classes/StreamSet';
import { ConfigType, FormulaType } from 'src/types/configuration';
import { MainUseCase } from 'src/use-cases/main.use-case';

describe('main tests', () => {
  test('getError', () => {
    expect(MainUseCase.hello()).toEqual(true);

    // const unit = new Unit('copper', 'items', 30);
    // console.log(unit, unit.like(new Unit('copper', 'items', 10)));
    // console.log(
    //   Unit.sum(
    //     new Unit('copper', 'items', 10),
    //     new Unit('oil', 'items', 20),
    //     new Unit('oil', 'm3', 20),
    //     new Unit('copper', 'items', 30),
    //   ),
    // );

    const engine = Engine.from({
      factories: {
        smelter: {
          initialPower: 4,
        },
        constructor: {
          initialPower: 4,
        },
        assembler: {
          initialPower: 15,
        },
        manufacturer: {
          initialPower: 55,
        },
        foundry: {
          initialPower: 16,
        },
        packager: {
          initialPower: 10,
        },
        refinery: {
          initialPower: 30,
        },
      },
      recipes: {
        IronPlate: {
          factory: 'constructor',
          content: [
            ['iron_ingot', 'ipm', -30],
            ['iron_plate', 'ipm', 20],
          ],
        },
        IronIngot: {
          factory: 'smelter',
          content: [
            ['iron_ore', 'ipm', -30],
            ['iron_ingot', 'ipm', 30],
          ],
        },
        AluminaSolution: {
          factory: 'refinery',
          content: [
            ['bauxite', 'ipm', -120],
            ['water', 'm3pm', -180],
            ['alumina_solution', 'm3pm', 120],
            ['silica', 'ipm', 50],
          ],
        },

        AluminumScrap: {
          factory: 'refinery',
          content: [
            ['alumina_solution', 'm3pm', -240],
            ['coal', 'ipm', -120],
            ['aluminum_scrap', 'ipm', 360],
            ['water', 'm3pm', 120],
          ],
        },

        AluminumIngot: {
          factory: 'foundry',
          content: [
            ['aluminum_scrap', 'ipm', -90],
            ['silica', 'ipm', -75],
            ['aluminum_ingot', 'ipm', 60],
          ],
        },
        PureAluminumIngot: {
          factory: 'smelter',
          content: [
            ['aluminum_scrap', 'ipm', -60],
            ['aluminum_ingot', 'ipm', 30],
          ],
        },

        Water: {
          factory: 'smelter', // другое
          content: [['water', 'm3pm', 120]],
        },
      },
    });
    if (engine instanceof Error) {
      console.error(engine);
    } else {
      const error = engine.set({
        formula1: [
          {
            restriction: 'eq',
            recipe: 'IronPlate',
            streamName: 'iron_plate',
          },
          {
            recipe: 'IronIngot',
            streamName: 'iron_ingot',
          },
        ],
        formula2: [
          {
            recipe: 'AluminaSolution',
            streamName: 'bauxite',
          },
          {
            recipe: 'AluminumScrap',
            streamName: 'alumina_solution',
          },
          {
            recipe: 'Water',
            streamName: 'water',
          },
          {
            recipe: 'AluminumIngot',
            streamName: 'silica',
          },
          {
            recipe: 'PureAluminumIngot',
            streamName: 'aluminum_scrap',
          },

          // const formula2 = Formula.fromEq(recipeAluminaSolution, 'bauxite', 'ipm')
          // .next(Formula.fromEq(recipeAluminumScrap, 'alumina_solution', 'm3pm'))
          // .next(Formula.fromEq(recipeWater, 'water', 'm3pm'))
          // .next(Formula.fromEq(recipeAluminumIngot, 'silica', 'ipm'))
          // .next(Formula.fromEq(recipePureAluminumIngot, 'aluminum_scrap', 'ipm'));
        ],
      });
      if (error instanceof Error) {
        console.error(error);
      } else {
        console.log(
          // engine.solve('formula1', ['iron_plate', -60]),
          // JSON.stringify(
          //   engine.solveDebug('formula1', ['iron_plate', -60]),
          //   null,
          //   2,
          // ),
          (() => {
            const { result } = engine.solve('formula2', ['bauxite', 780 * 2]);
            result.forEach((item) => {
              // @ts-ignore
              item.power = item.power.value;
            });
            return { result };
          })(),
          engine
            .solve('formula2', ['bauxite', 780 * 2])
            .result.map((item) => item.power)
            .reduce(
              (prev, curr) => prev.sum(curr),
              new Stream('power', 'MW', 0),
            ),
          engine
            .solve('formula2', ['bauxite', 780 * 2])
            .result.map((item) => item.power)
            .reduce(
              (prev, curr) => prev.sum(curr),
              new Stream('power', 'MW', 0),
            ),
          // JSON.stringify(
          //   engine.solveDebug('formula2', ['bauxite', 780 * 2]),
          //   null,
          //   2,
          // ),
        );
      }

      // engine.add(
      //   'solve1',
      //   Formula.fromEq(
      //     engine.recipes.get('IronPlate')!,
      //     'iron_plate',
      //     'ipm',
      //   ).next(
      //     Formula.fromEq(engine.recipes.get('IronIngot')!, 'iron_ingot', 'ipm'),
      //   ),
      // );
      // console.log(
      //   engine.solve('solve1', new Stream('iron_plate', 'ipm', -60)),
      //   // JSON.stringify(
      //   //   engine.solveDebug('solve1', new Stream('iron_plate', 'ipm', -60)),
      //   //   null,
      //   //   2,
      //   // ),
      // );
    }

    const factorySmelter = new Factory('smelter', new Stream('power', 'MW', 4));
    const factoryConstructor = new Factory(
      'constructor',
      new Stream('power', 'MW', 4),
    );
    const factoryAssembler = new Factory(
      'assembler',
      new Stream('power', 'MW', 15),
    );
    const factoryManufacturer = new Factory(
      'manufacturer',
      new Stream('power', 'MW', 55),
    );
    const factoryFoundry = new Factory(
      'foundry',
      new Stream('power', 'MW', 16),
    );
    const factoryPackager = new Factory(
      'packager',
      new Stream('power', 'MW', 10),
    );

    const factoryRefinery = new Factory(
      'refinery',
      new Stream('power', 'MW', 30),
    );

    // const target = new Stream<'ipm'>('iron_plate', 'ipm', -60);
    // const recipeIronPlate = new Recipe(
    //   'IronPlate',
    //   factoryConstructor,
    //   new Stream('iron_ingot', 'ipm', -30),
    //   new Stream('iron_plate', 'ipm', 20),
    // );
    // const recipeIronIngot = new Recipe(
    //   'IronIngot',
    //   factorySmelter,
    //   new Stream('iron_ore', 'ipm', -30),
    //   new Stream('iron_ingot', 'ipm', 30),
    // );

    // const formula1 = Formula.fromEq(recipeIronPlate, 'iron_plate', 'ipm').next(
    //   Formula.fromEq(recipeIronIngot, 'iron_ingot', 'ipm'),
    // );

    // console.log(JSON.stringify(formula1.debug, null, 2));

    // console.log(
    //   JSON.stringify(formula1.solveDebug(new StreamSet(target)), null, 2),
    // );
    // console.log(
    //   formula1.solve(new StreamSet(target)).map(({ recipe, ...other }) => ({
    //     ...other,
    //     factory: recipe.factory.name,
    //   })),
    // );

    // const solve = new StreamSet(target);
    // solve.applyRecipe('iron_plate', 'ipm', recipeIronPlate);
    // solve.applyRecipe('iron_ingot', 'ipm', recipeIronIngot);

    const recipeAluminaSolution = new Recipe(
      'AluminaSolution',
      factoryRefinery,
      new Stream('bauxite', 'ipm', -120),
      new Stream('water', 'm3pm', -180),
      new Stream('alumina_solution', 'm3pm', 120),
      new Stream('silica', 'ipm', 50),
    );

    const recipeAluminumScrap = new Recipe(
      'AluminumScrap',
      factoryRefinery,
      new Stream('alumina_solution', 'm3pm', -240),
      new Stream('coal', 'ipm', -120),
      new Stream('aluminum_scrap', 'ipm', 360),
      new Stream('water', 'm3pm', 120),
    );

    const recipeAluminumIngot = new Recipe(
      'AluminumIngot',
      factoryFoundry,
      new Stream('aluminum_scrap', 'ipm', -90),
      new Stream('silica', 'ipm', -75),
      new Stream('aluminum_ingot', 'ipm', 60),
    );

    const recipePureAluminumIngot = new Recipe(
      'PureAluminumIngot',
      factorySmelter,
      new Stream('aluminum_scrap', 'ipm', -60),
      new Stream('aluminum_ingot', 'ipm', 30),
    );

    // Проверить
    const recipeWater = new Recipe(
      'Water',
      factorySmelter, // другое
      new Stream('water', 'm3pm', 120),
    );

    // Добавить ограничение на число фабрик + правильно учесть затраты энергии
    const formula2 = Formula.fromEq(recipeAluminaSolution, 'bauxite', 'ipm')
      .next(Formula.fromEq(recipeAluminumScrap, 'alumina_solution', 'm3pm'))
      .next(Formula.fromEq(recipeWater, 'water', 'm3pm'))
      .next(Formula.fromEq(recipeAluminumIngot, 'silica', 'ipm'))
      .next(Formula.fromEq(recipePureAluminumIngot, 'aluminum_scrap', 'ipm'));

    const results = formula2.solve(
      new StreamSet(new Stream('bauxite', 'ipm', 780 * 2)),
    );

    console.log(
      results.map(({ recipe, streamSet, ...other }) => ({
        ...other,
        factory: recipe.factory.name,
        recipe: recipe.name,
        ...Object.fromEntries(
          [...streamSet.map.entries()].map(([key, stream]) => [
            key,
            {
              name: stream.name,
              measure: stream.measure,
              value: stream.value,
            },
          ]),
        ),
      })),
      {
        energy: results
          .map((item) => Factory.power(item.recipe.factory, item.factoryIndex))
          .reduce((prev, curr) => prev.sum(curr), new Stream('power', 'MW', 0)),
      },
      {
        energy: new Stream('power', 'MW', 0)
          .sum(factoryRefinery.power.prod(13))
          .sum(
            factoryRefinery.power
              .prod(6)
              .sum(Factory.copy(factoryRefinery).setProductivity(50).power),
          )
          .sum(factorySmelter.power.prod(13))
          .sum(
            factoryFoundry.power
              .prod(8)
              .sum(
                Factory.copy(factoryFoundry).setProductivity(66.666666666)
                  .power,
              ),
          )
          .sum(factorySmelter.power.prod(26)),
      },
    );

    console.log(
      Engine.validate({
        factories: { some: { initialPower: 10 } },
        recipes: {
          firstRecipe: {
            factory: 'some',
            content: [['some', 'MW', 10]],
          },
        },
      }),
    );

    // const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

    // const schema = {
    //   type: 'object',
    //   properties: {
    //     foo: { type: 'integer' },
    //     bar: { type: 'string' },
    //   },
    //   required: ['foo'],
    //   additionalProperties: false,
    // };

    // const validate = ajv.compile(schema);

    // const data = {
    //   foo: 1,
    //   bar: 'abc',
    // };

    // const valid = validate(data);
    // if (!valid) console.log(validate.errors);

    // solve.sum(
    //   StreamSet.copy(recipeIronPlate).prod(recipeIronPlate.ratio(target)),
    // );
    // const ironIngot = solve.find('iron_ingot', 'ipm');
    // if (ironIngot) {
    //   solve.sum(
    //     StreamSet.copy(recipeIronIngot).prod(recipeIronIngot.ratio(ironIngot)),
    //   );
    // }

    // solve.prod(solve.ratio(target)).rev().add(target);
    // Unit.sum(
    //   ...Unit.prod(10, new Unit('iron_ingot', 'items', -3)),
    //   ...Unit.prod(10, new Unit('iron_plate', 'items', 2)), // items -> ipm!
    // );

    // console.log([...solve.map.values()]);

    // console.log([
    //   ...solve.prod(solve.ratio(target)).rev().add(target).map.values(),
    // ]);

    // recipe.prod('iron_plate', target).rev().sum(target);

    expect('copper').toEqual('copper');
  });
});
