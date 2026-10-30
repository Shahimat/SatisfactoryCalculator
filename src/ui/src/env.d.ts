/// <reference types="@rsbuild/core/types" />

/** Game catalog of the latest data version: fetched in the app, the JSON file in tests (aliases in rsbuild and vitest configs). */
declare module '@catalog' {
  import type { Catalog } from '../../data/src/catalog.types.ts';
  const catalog: Catalog;
  export default catalog;
}

declare const __BUILD_DATE__: string;
/** Catalog file name with a content hash, served under `catalog/`. */
declare const __CATALOG_FILE__: string;
