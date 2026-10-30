import { defineConfig } from 'vitest/config';

import { latestCatalog } from './rsbuild.config';

export default defineConfig({
  resolve: {
    alias: { '@catalog': latestCatalog() },
  },
  test: {
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
