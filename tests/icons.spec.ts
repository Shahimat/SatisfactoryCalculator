import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'vitest';

import { fetchIcons } from '../scripts/catalog/fetch-icons.ts';
import {
  politeFetch,
  USER_AGENT,
  wikiFileName,
} from '../scripts/catalog/wiki-icons.ts';

const noSleep = async (): Promise<void> => {};

const apiResponse = (files: Record<string, string | undefined>): Response =>
  Response.json({
    query: {
      pages: Object.fromEntries(
        Object.entries(files).map(([title, url], index) => [
          String(url ? index : -index - 1),
          url
            ? { title, imageinfo: [{ thumburl: url }] }
            : { title, missing: '' },
        ]),
      ),
    },
  });

describe('wiki icons', () => {
  it('maps display names to wiki file names', () => {
    assert.equal(
      wikiFileName({ id: 'Desc_IronPlate_C', name: 'Iron Plate' }),
      'Iron_Plate.png',
    );
    assert.equal(
      wikiFileName({ id: 'Build_MinerMk1_C', name: 'Miner Mk.1' }),
      'Miner_Mk.1.png',
    );
  });

  it('waits for Retry-After on 429 and sends the user agent', async () => {
    const waits: number[] = [];
    const agents: (string | null)[] = [];
    const responses = [
      new Response('', { status: 429, headers: { 'retry-after': '7' } }),
      new Response('ok'),
    ];
    const response = await politeFetch(
      'https://example.test/x.png',
      async (_url, init) => {
        agents.push(new Headers(init?.headers).get('User-Agent'));
        return responses.shift() ?? new Response('', { status: 500 });
      },
      async (ms) => {
        waits.push(ms);
      },
    );
    assert.equal(response.status, 200);
    assert.deepEqual(waits, [7000]);
    assert.deepEqual(agents, [USER_AGENT, USER_AGENT]);
  });

  it('downloads missing icons, keeps cached ones and reports unknown files', async () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'icons-'));
    writeFileSync(path.join(dir, 'Desc_Cached_C.png'), 'cached');
    const requested: string[] = [];
    const result = await fetchIcons(
      [
        { id: 'Desc_Cached_C', name: 'Cached' },
        { id: 'Desc_IronPlate_C', name: 'Iron Plate' },
        { id: 'Desc_Unknown_C', name: 'Unknown Thing' },
      ],
      dir,
      async (url) => {
        requested.push(url);
        if (url.includes('api.php')) {
          return apiResponse({
            'File:Iron Plate.png': 'https://wiki.test/64px-Iron_Plate.png',
            'File:Unknown Thing.png': undefined,
          });
        }
        return new Response('png-bytes');
      },
      noSleep,
    );
    assert.deepEqual(result.cached, ['Desc_Cached_C']);
    assert.deepEqual(result.downloaded, ['Desc_IronPlate_C']);
    assert.deepEqual(
      result.missing.map((s) => s.id),
      ['Desc_Unknown_C'],
    );
    assert.ok(existsSync(path.join(dir, 'Desc_IronPlate_C.png')));
    assert.equal(requested.filter((url) => url.includes('api.php')).length, 1);
    assert.ok(!requested.some((url) => url.includes('Cached')));
  });
});
