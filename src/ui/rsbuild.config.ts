import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

const DATA_DIR = path.resolve(__dirname, '../../data');
const CATALOG_DIR = path.join(DATA_DIR, 'catalog');
const ICONS_DIR = path.join(DATA_DIR, 'icons');

/** GitHub Pages serves a project site under the repository name; CI passes it in. */
const PAGES_BASE = process.env['PAGES_BASE'] ?? '/satisfactory-calculator/';

const latestCatalog = (): string => {
  const versions = existsSync(CATALOG_DIR)
    ? readdirSync(CATALOG_DIR)
        .filter((file) => file.endsWith('.json'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    : [];
  const latest = versions.at(-1);
  if (!latest) {
    throw new Error(
      `No game catalog in ${CATALOG_DIR}: run \`npm run data:catalog\` first`,
    );
  }
  return path.join(CATALOG_DIR, latest);
};

export default defineConfig(({ envMode }) => ({
  source: {
    tsconfigPath: './tsconfig.ui.json',
    define: {
      __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('ru')),
    },
  },
  resolve: {
    alias: { '@catalog': latestCatalog() },
  },
  output: {
    assetPrefix: envMode === 'production' ? PAGES_BASE : '/',
    copy: existsSync(ICONS_DIR) ? [{ from: ICONS_DIR, to: 'icons' }] : [],
  },
  html: {
    title: 'Satisfactory — калькулятор производства',
    favicon: './src/assets/favicon.png',
    tags: [
      {
        tag: 'link',
        attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      },
      {
        tag: 'link',
        attrs: {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Roboto+Condensed:wght@600;700&family=Roboto+Mono:wght@400;500;600&family=Roboto:wght@400;500&display=swap',
        },
      },
    ],
  },
  plugins: [
    pluginReact({
      swcReactOptions: {
        importSource: '@emotion/react',
      },
    }),
  ],
  tools: {
    swc: {
      jsc: {
        experimental: {
          plugins: [['@swc/plugin-emotion', {}]],
        },
      },
    },
  },
}));
