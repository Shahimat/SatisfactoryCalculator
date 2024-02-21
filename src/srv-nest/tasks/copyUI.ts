import { copy } from 'fs-extra';
import { join } from 'path';

const BASE_PATH = join(__dirname, '..');
const UI_PATH = join(BASE_PATH, '..', 'ui');

console.log('⚡️[copy-ui]: run task');
(async () => {
  console.log('⚡️[copy-ui]: copy actual src to folder');
  await copy(join(UI_PATH, 'build'), join(BASE_PATH, 'ui'));
  console.log('⚡️[copy-src]: finish task');
})();
