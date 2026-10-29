/// <reference types="@rsbuild/core/types" />

/**
 * Imports the SVG file as a React component.
 * @requires [@rsbuild/plugin-svgr](https://npmjs.com/package/@rsbuild/plugin-svgr)
 */
declare module '*.svg?react' {
  import type React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

/** Game catalog of the latest data version, aliased in rsbuild.config.ts. */
declare module '@catalog' {
  import type { Catalog } from '../../data/src/catalog.types.ts';
  const catalog: Catalog;
  export default catalog;
}

declare const __BUILD_DATE__: string;
