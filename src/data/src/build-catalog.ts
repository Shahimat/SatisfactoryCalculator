import { createHash } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { buildCatalog } from './catalog.ts';
import type { Catalog, SourceManifest } from './catalog.types.ts';
import { readGameDocs } from './game-docs.ts';

export const DATA_DIR = path.resolve(import.meta.dirname, '../../../data');

export const latestVersion = (): string => {
  const versions = readdirSync(path.join(DATA_DIR, 'raw')).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true }),
  );
  const latest = versions.at(-1);
  if (!latest)
    throw new Error(`No game versions in ${path.join(DATA_DIR, 'raw')}`);
  return latest;
};

export const readManifest = (rawDir: string): SourceManifest => {
  const manifest = JSON.parse(
    readFileSync(path.join(rawDir, 'source.json'), 'utf8'),
  ) as SourceManifest;
  for (const [file, expected] of Object.entries(manifest.files)) {
    const actual = createHash('sha256')
      .update(readFileSync(path.join(rawDir, file)))
      .digest('hex');
    if (actual !== expected) {
      throw new Error(`${file}: sha256 ${actual} does not match source.json`);
    }
  }
  return manifest;
};

export const buildVersion = (version: string): Catalog => {
  const rawDir = path.join(DATA_DIR, 'raw', version);
  const manifest = readManifest(rawDir);
  return buildCatalog(
    readGameDocs(path.join(rawDir, 'en-US.json')),
    readGameDocs(path.join(rawDir, 'ru.json')),
    version,
    manifest,
  );
};

if (import.meta.main) {
  const version = process.argv[2] ?? latestVersion();
  const catalog = buildVersion(version);
  const outDir = path.join(DATA_DIR, 'catalog');
  mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${version}.json`);
  writeFileSync(outFile, JSON.stringify(catalog, null, 2) + '\n');
  console.log(
    `${outFile}: ${catalog.items.length} items, ${catalog.buildings.length} buildings, ${catalog.recipes.length} recipes`,
  );
}
