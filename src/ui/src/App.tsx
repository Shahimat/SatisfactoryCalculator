import { css } from '@emotion/react';
import './App.css';

const App = () => {
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
    </div>
  );
};

export default App;
