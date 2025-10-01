import { css } from '@emotion/react';
import './App.css';
import { Formula, Stream, StreamSet, type ContextType } from './classes';
import {
  recipes,
  recipesDictionary,
  type RecipeName,
} from './constants/recipes';
import { StreamGrid } from './components/stream-grid';
import { useState } from 'react';
import { FormulaGrid } from './components/formula-grid';
import { items, itemsDictionary } from './constants/items';

const App = () => {
  const [input, setInput] = useState<Stream[]>([
    // items.iron_plate.with(90)
    items.iron_ingot.with(90),
  ]);

  const [formulaConfig, setFormulaConfig] = useState<
    { recipeName: RecipeName; stream: Stream }[]
  >([
    // {
    //   recipeName: 'ironPlate',
    //   stream: new Stream('iron_plate', 'ipm'),
    // },
    {
      recipeName: 'ironIngot',
      stream: new Stream('iron_ingot', 'ipm'),
    },
  ]);

  const formula = new Formula();

  for (const config of formulaConfig) {
    formula.fullDepletion(recipes[config.recipeName], config.stream);
  }

  const context: ContextType = new Map();

  const result = formula.solve(context, ...input);
  const output: Stream[] =
    result instanceof Error
      ? []
      : [...result.map.values()].filter((item) => item.value !== 0);

  return (
    <div className="content">
      <div
        css={css`
          color: green;
        `}
      >
        Input
      </div>
      <StreamGrid
        input={input}
        dictionary={itemsDictionary}
        onChangeItem={(rowIndex, value) => {
          setInput((prev) =>
            prev.map((item, ind) =>
              ind === rowIndex ? items[value].with(item.value) : item,
            ),
          );
        }}
        onChangeValue={(rowIndex, value) => {
          setInput((prev) =>
            prev.map((item, ind) => {
              if (ind === rowIndex) {
                item.value = value;
              }
              return item;
            }),
          );
        }}
      />
      <div>Formula</div>
      <FormulaGrid
        input={formulaConfig.map(({ recipeName, stream }) => {
          const numberOfFactories = context.get(stream.key);
          return {
            recipe: recipeName,
            itemName: stream.name,
            measure: stream.measure,
            factory: recipes[recipeName].factory.name,
            numberOfFactories:
              numberOfFactories === null ||
              numberOfFactories === undefined ||
              numberOfFactories instanceof StreamSet
                ? 0
                : numberOfFactories,
          };
        })}
        dictionary={recipesDictionary}
        onChangeRecipe={(rowIndex, value) => {
          setFormulaConfig((prev) =>
            prev.map((item, ind) =>
              ind === rowIndex
                ? {
                    recipeName: value,
                    stream: item.stream,
                  }
                : item,
            ),
          );
        }}
      />
      <div>Output</div>
      <StreamGrid input={output} />
    </div>
  );
};

export default App;
