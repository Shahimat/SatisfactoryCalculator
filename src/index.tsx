import { render } from 'preact';

import { loadCatalog } from './catalog-fetch';
import { initialLocale, loadLocale } from './i18n';
import './styles.css';

const rootEl = document.getElementById('root');

// The app reads the catalog and the messages synchronously, so it is imported
// after both load; its chunk is preloaded from index.html (performance.preload
// in rsbuild.config.ts), so both download in parallel. No top-level await:
// Prefresh (dev HMR) breaks in modules that resume after one.
void Promise.all([loadCatalog(), loadLocale(initialLocale())])
  .then(() => import(/* webpackChunkName: "app" */ './App'))
  .then(({ default: App }) => {
    if (rootEl) render(<App />, rootEl);
  });
