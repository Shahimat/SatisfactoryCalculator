import { render } from 'preact';

import { loadCatalog } from './catalog-fetch';
import './styles.css';

const rootEl = document.getElementById('root');

// The app reads the catalog synchronously on import, so it is imported after
// the catalog loads; its chunk is preloaded from index.html (performance.preload
// in rsbuild.config.ts), so both download in parallel. No top-level await:
// Prefresh (dev HMR) breaks in modules that resume after one.
void loadCatalog()
  .then(() => import(/* webpackChunkName: "app" */ './App'))
  .then(({ default: App }) => {
    if (rootEl) render(<App />, rootEl);
  });
