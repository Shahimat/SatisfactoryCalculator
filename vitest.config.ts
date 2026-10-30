import { defineConfig } from 'vitest/config';

import { latestCatalog } from './rsbuild.config';

export default defineConfig({
  resolve: {
    alias: {
      '@catalog': latestCatalog(),
      // As in the build (plugin-preact): React API from preact/compat.
      react: 'preact/compat',
    },
  },
  test: {
    include: ['tests/**/*.spec.ts'],
    setupFiles: ['./tests/setup.ts'],
    typecheck: {
      tsconfig: './tsconfig.test.json',
    },
  },
});
