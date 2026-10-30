import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { defineConfig } from '@rsbuild/core';
import { pluginPreact } from '@rsbuild/plugin-preact';

const DATA_DIR = path.resolve(__dirname, '../../data');
const CATALOG_DIR = path.join(DATA_DIR, 'catalog');
const ICONS_DIR = path.join(DATA_DIR, 'icons');

/** GitHub Pages serves a project site under the repository name; CI passes it in. */
const PAGES_BASE = process.env['PAGES_BASE'] ?? '/satisfactory-calculator/';

export const latestCatalog = (): string => {
  const versions = existsSync(CATALOG_DIR)
    ? readdirSync(CATALOG_DIR)
        .filter((file) => file.endsWith('.json'))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    : [];
  const latest = versions[versions.length - 1];
  if (!latest) {
    throw new Error(
      `No game catalog in ${CATALOG_DIR}: run \`npm run data:catalog\` first`,
    );
  }
  return path.join(CATALOG_DIR, latest);
};

/** Served catalog name; the content hash refreshes caches when the file is rebuilt. */
const catalogFile = (file: string): string => {
  const hash = createHash('sha256')
    .update(readFileSync(file))
    .digest('hex')
    .slice(0, 8);
  return `${path.basename(file)}?v=${hash}`;
};

export default defineConfig(({ envMode }) => {
  const catalog = latestCatalog();
  const served = catalogFile(catalog);
  const prefix = envMode === 'production' ? PAGES_BASE : '/';
  return {
    source: {
      tsconfigPath: './tsconfig.ui.json',
      define: {
        // ISO date: the app formats it in the chosen language.
        __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
        __CATALOG_FILE__: JSON.stringify(served),
      },
    },
    resolve: {
      alias: { '@catalog': './src/catalog-fetch.ts' },
    },
    output: {
      assetPrefix: prefix,
      copy: [
        { from: catalog, to: 'catalog' },
        ...(existsSync(ICONS_DIR) ? [{ from: ICONS_DIR, to: 'icons' }] : []),
      ],
    },
    html: {
      title: 'Satisfactory — калькулятор производства',
      favicon: './src/assets/favicon.png',
      tags: [
        {
          tag: 'link',
          attrs: {
            rel: 'preload',
            // rsbuild prefixes tag URLs with the asset prefix itself.
            href: `catalog/${served}`,
            as: 'fetch',
            crossorigin: 'anonymous',
          },
        },
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
    // `react` imports resolve to preact/compat: React semantics
    // (onChange on every keystroke) at Preact size.
    performance: {
      // The app chunk waits for the catalog (src/index.tsx); preload starts both at once.
      preload: { type: 'async-chunks', include: [/[\\/]app\./] },
    },
    plugins: [pluginPreact()],
  };
});
