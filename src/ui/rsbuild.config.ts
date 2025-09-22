import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';

export default defineConfig({
  source: {
    tsconfigPath: './tsconfig.ui.json',
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
});
