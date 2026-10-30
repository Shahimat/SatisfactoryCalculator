/**
 * Pixel difference between two screenshot sets of scripts/visual/screenshots.ts.
 *
 *   node scripts/visual/compare.ts <baseline-dir> <current-dir> [diff-dir]
 *
 * Needs ImageMagick (`compare`). Prints changed pixels per screen, writes diff
 * images with changes in red when diff-dir is given; exits 1 if any screen differs.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const [baseline, current, diffs] = process.argv.slice(2);
if (!baseline || !current) {
  console.error(
    'usage: node scripts/visual/compare.ts <baseline-dir> <current-dir> [diff-dir]',
  );
  process.exit(2);
}
if (diffs) mkdirSync(diffs, { recursive: true });

let changed = 0;
for (const file of readdirSync(baseline)
  .filter((f) => f.endsWith('.png'))
  .sort()) {
  const other = path.join(current, file);
  if (!existsSync(other)) {
    console.log(`${file}: missing in ${current}`);
    changed++;
    continue;
  }
  const result = spawnSync('compare', [
    '-metric',
    'AE',
    path.join(baseline, file),
    other,
    diffs ? path.join(diffs, file) : 'null:',
  ]);
  // `compare` prints the metric to stderr and exits 1 when images differ.
  const pixels = Number.parseFloat(result.stderr.toString());
  if (Number.isNaN(pixels)) {
    console.log(`${file}: ${result.stderr.toString().trim()}`);
    changed++;
  } else {
    console.log(`${file}: ${pixels} px`);
    if (pixels > 0) changed++;
  }
}
process.exit(changed === 0 ? 0 : 1);
