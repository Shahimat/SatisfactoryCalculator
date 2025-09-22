import { css } from '@emotion/react';
import './App.css';
import { GridExample } from './ag-grid';
import { Factory, Formula, Recipe, Stream, type ContextType } from './classes';

const App = () => {
  const factoryConstructor = new Factory(
    'constructor',
    new Stream('power', 'MW', 4),
  );
  const factorySmelter = new Factory('smelter', new Stream('power', 'MW', 4));

  const recipeIronPlate = Recipe.from(
    'IronPlate',
    factoryConstructor,
    new Stream('iron_ingot', 'ipm', -30),
    new Stream('iron_plate', 'ipm', 20),
  );
  const recipeIronIngot = Recipe.from(
    'IronIngot',
    factorySmelter,
    new Stream('iron_ore', 'ipm', -30),
    new Stream('iron_ingot', 'ipm', 30),
  );

  const formula = new Formula()
    .fullDepletion(recipeIronPlate, new Stream('iron_plate', 'ipm'))
    .fullDepletion(recipeIronIngot, new Stream('iron_ingot', 'ipm'));

  const context: ContextType = new Map();
  console.log(formula.solve(context, new Stream('iron_plate', 'ipm', 90)));
  console.log(context);

  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
      <div
        css={css`
          color: green;
        `}
      >
        EMotion
      </div>
      <GridExample />
    </div>
  );
};

export default App;
