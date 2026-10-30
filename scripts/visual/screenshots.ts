/**
 * Screenshots of every screen with a fixed state, for visual regression checks.
 *
 *   node scripts/visual/screenshots.ts <dist-dir | url> <out-dir>
 *
 * A dist directory must be built for the root path (`PAGES_BASE=/ npm run build`).
 * Env: LOCALE=ru|en (default ru), CHROME (default google-chrome-stable), PORT.
 * Writes one PNG per screen and report.json; exits 1 on console errors or when
 * typing into a field does not update the stored state on every keystroke.
 */
import { spawn } from 'node:child_process';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { setTimeout as sleep } from 'node:timers/promises';

const [target, out] = process.argv.slice(2);
if (!target || !out) {
  console.error(
    'usage: node scripts/visual/screenshots.ts <dist-dir | url> <out-dir>',
  );
  process.exit(2);
}
const locale = process.env['LOCALE'] === 'en' ? 'en' : 'ru';
const port = Number(process.env['PORT'] ?? 4791);
mkdirSync(out, { recursive: true });

/** Labels the script clicks by; mirror src/i18n (rows.expand, rows.configure, calc.nameAria). */
const LABELS = {
  ru: {
    expand: 'Развернуть',
    configure: 'Настроить',
    name: 'Название расчёта',
  },
  en: { expand: 'Expand', configure: 'Configure', name: 'Calculation name' },
}[locale];

const TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.webp': 'image/webp',
};
const remote = /^https?:\/\//.test(target);
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(
    new URL(req.url ?? '/', 'http://x').pathname,
  );
  let file = path.join(target, pathname);
  if (!existsSync(file) || statSync(file).isDirectory()) {
    file = path.join(target, 'index.html');
  }
  res.writeHead(200, {
    'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(res);
});
if (!remote) server.listen(port);
const root = remote ? target : `http://127.0.0.1:${port}/`;

const debugPort = port + 1;
const chrome = spawn(
  process.env['CHROME'] ?? 'google-chrome-stable',
  [
    '--headless=new',
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${path.resolve(out, 'profile')}`,
    '--window-size=1600,1000',
    '--no-first-run',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' },
);

let ws: WebSocket | undefined;
for (let i = 0; i < 50 && !ws; i++) {
  await sleep(200);
  try {
    const targets = (await (
      await fetch(`http://127.0.0.1:${debugPort}/json`)
    ).json()) as { type: string; webSocketDebuggerUrl: string }[];
    const page = targets.find((t) => t.type === 'page');
    if (page) ws = new WebSocket(page.webSocketDebuggerUrl);
  } catch {
    // Chrome is still starting.
  }
}
if (!ws) throw new Error('Chrome DevTools did not start');
const socket = ws;
await new Promise((resolve) => socket.addEventListener('open', resolve));

/** The parts of DevTools protocol messages this script reads. */
type Message = {
  id?: number;
  method?: string;
  params?: {
    type?: string;
    args?: { value?: unknown; description?: string }[];
    exceptionDetails?: { text: string; exception?: { description?: string } };
  };
  result?: { data?: string; result?: { value?: unknown } };
};
let nextId = 0;
const pending = new Map<number, (message: Message) => void>();
const errors: string[] = [];
socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(String(data)) as Message;
  if (message.id !== undefined) pending.get(message.id)?.(message);
  const { method, params } = message;
  if (method === 'Runtime.exceptionThrown' && params?.exceptionDetails) {
    const details = params.exceptionDetails;
    errors.push(details.exception?.description ?? details.text);
  }
  if (
    method === 'Runtime.consoleAPICalled' &&
    (params?.type === 'error' || params?.type === 'warning')
  ) {
    errors.push(
      (params.args ?? [])
        .map((a) => String(a.value ?? a.description))
        .join(' '),
    );
  }
});
const send = (method: string, params: object = {}) =>
  new Promise<Message>((resolve) => {
    const id = ++nextId;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });
const evaluate = async (expression: string): Promise<unknown> =>
  (
    await send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    })
  ).result?.result?.value;

await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1600,
  height: 1000,
  deviceScaleFactor: 1,
  mobile: false,
});

const recipeRow = (id: string, recipe: string, count: number) => ({
  kind: 'recipe',
  id,
  recipe,
  groups: [{ count, clock: 1, somersloops: 0 }],
});
const entity = { gameVersion: '1.2', recipeSignatures: {} };
/** Covers recipe, fixed, workshop and plant rows, goals and both solver modes. */
const STATE = {
  schema: 1,
  units: 'ipm',
  workshops: [
    {
      ...entity,
      id: 'w1',
      name: 'Screws',
      goals: [{ item: 'Desc_IronScrew_C', perMinute: 120 }],
      solver: 'matrix',
      rows: [
        recipeRow('wr1', 'Recipe_IronRod_C', 2),
        recipeRow('wr2', 'Recipe_Screw_C', 3),
      ],
    },
  ],
  calculations: [
    {
      ...entity,
      id: 'c1',
      name: 'Iron',
      built: 2,
      goals: [{ item: 'Desc_IronPlate_C', perMinute: 60 }],
      solver: 'matrix',
      rows: [
        recipeRow('r1', 'Recipe_IngotIron_C', 3),
        recipeRow('r2', 'Recipe_IronPlate_C', 3),
        { ...recipeRow('r3', 'Recipe_Alternate_Screw_C', 1), sizing: 'fixed' },
        { kind: 'workshop', id: 'r4', workshop: 'w1', copies: 1.5 },
      ],
    },
    {
      ...entity,
      id: 'c2',
      name: 'Draft',
      built: 0,
      goals: [],
      solver: 'sequential',
      rows: [{ kind: 'plant', id: 'p1', calculation: 'c1', copies: 2 }],
    },
  ],
};

await send('Page.navigate', { url: root });
await sleep(800);
await evaluate(
  `localStorage.setItem('satisfactory-calculator/state', ${JSON.stringify(JSON.stringify(STATE))});` +
    `localStorage.setItem('satisfactory-calculator/locale', '${locale}')`,
);

const shot = async (name: string) => {
  await sleep(700);
  const { result } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(
    path.join(out, `${name}.png`),
    Buffer.from(result?.data ?? '', 'base64'),
  );
};
const open = async (hash: string, name: string) => {
  await send('Page.navigate', { url: `${root}#/${hash}` });
  await sleep(600);
  await evaluate('location.reload()');
  await shot(name);
};

await open('calc/c1', '01-calc');
await evaluate(
  `document.querySelector('button[title="${LABELS.expand}"]')?.click()`,
);
await shot('02-calc-expanded');
await evaluate(
  `document.querySelector('[role=button][title^="${LABELS.configure}"]')?.click()`,
);
await shot('03-edit-row');
await open('calc/c2', '04-calc-plant');
await open('workshops/w1', '05-workshop');
await open('plants', '06-plants');
await open('reference/recipes', '07-reference-recipes');
await open('reference/items', '08-reference-items');
await open('reference/buildings', '09-reference-buildings');

// React semantics on Preact: the state follows every keystroke, without blur.
await open('calc/c1', '10-calc-typing');
const field = `document.querySelector('input[aria-label="${LABELS.name}"]')`;
await evaluate(`${field}.focus()`);
await send('Input.insertText', { text: 'X' });
await sleep(200);
const stored = await evaluate(
  `JSON.parse(localStorage.getItem('satisfactory-calculator/state')).calculations[0].name`,
);
const typing = stored === 'IronX';

const report = { locale, typing, errors };
writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
socket.close();
chrome.kill();
server.close();
process.exit(typing && errors.length === 0 ? 0 : 1);
