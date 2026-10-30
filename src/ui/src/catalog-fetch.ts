import type { Catalog } from '../../data/src/catalog.types.ts';

let catalog: Catalog | undefined;

/**
 * Game catalog behind the `@catalog` alias: a separate file, cached apart from
 * the code and parsed as JSON, not as a script. The binding is live, so modules
 * imported after `loadCatalog` read the loaded catalog synchronously.
 */
export { catalog as default };

export const loadCatalog = async (): Promise<void> => {
  const response = await fetch(
    `${import.meta.env.ASSET_PREFIX}/catalog/${__CATALOG_FILE__}`,
  );
  if (!response.ok) {
    throw new Error(`Game catalog: ${response.status} ${response.statusText}`);
  }
  catalog = await response.json();
};
