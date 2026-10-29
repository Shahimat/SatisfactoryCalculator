import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

import { buildVersion, DATA_DIR, latestVersion } from './build-catalog.ts';
import type { Catalog } from './catalog.types.ts';
import {
  type FetchLike,
  type IconSource,
  politeFetch,
  resolveThumbUrls,
  type Sleep,
  wikiFileName,
} from './wiki-icons.ts';

export const ICONS_DIR = path.join(DATA_DIR, 'icons');
const ICON_WIDTH = 96;
const PAUSE_MS = 300;

/** Items the interface shows although no production recipe uses them. */
const INTERFACE_ICONS: IconSource[] = [
  { id: 'Desc_WAT1_C', name: 'Somersloop' },
];

export const iconSources = (catalog: Catalog): IconSource[] => [
  ...[...catalog.items, ...catalog.buildings].map(({ id, name }) => ({
    id,
    name: name.en,
  })),
  ...INTERFACE_ICONS,
];

export type IconsResult = {
  downloaded: string[];
  cached: string[];
  missing: IconSource[];
};

/** Downloads missing icons into `dir` as `<id>.png`; files already in `dir` are kept as cache. */
export const fetchIcons = async (
  sources: IconSource[],
  dir: string,
  fetchFn: FetchLike,
  wait: Sleep,
): Promise<IconsResult> => {
  mkdirSync(dir, { recursive: true });
  const result: IconsResult = { downloaded: [], cached: [], missing: [] };
  const pending = sources.filter((source) => {
    const cached = existsSync(path.join(dir, `${source.id}.png`));
    if (cached) result.cached.push(source.id);
    return !cached;
  });
  if (pending.length === 0) return result;

  const urls = await resolveThumbUrls(
    pending.map(wikiFileName),
    ICON_WIDTH,
    fetchFn,
    wait,
  );
  for (const source of pending) {
    const url = urls.get(wikiFileName(source));
    if (!url) {
      result.missing.push(source);
      continue;
    }
    const response = await politeFetch(url, fetchFn, wait);
    if (!response.ok) {
      result.missing.push(source);
      continue;
    }
    writeFileSync(
      path.join(dir, `${source.id}.png`),
      Buffer.from(await response.arrayBuffer()),
    );
    result.downloaded.push(source.id);
    await wait(PAUSE_MS);
  }
  return result;
};

if (import.meta.main) {
  const version = process.argv[2] ?? latestVersion();
  const sources = iconSources(buildVersion(version));
  const result = await fetchIcons(sources, ICONS_DIR, fetch, (ms) => sleep(ms));
  console.log(
    `${ICONS_DIR}: ${result.downloaded.length} downloaded, ${result.cached.length} cached, ${result.missing.length} missing`,
  );
  for (const { id, name } of result.missing)
    console.log(`  missing ${id} (${wikiFileName({ id, name })})`);
}
