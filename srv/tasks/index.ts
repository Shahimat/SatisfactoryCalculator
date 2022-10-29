import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../src/data-source';
import fillDB from './fill-db-global';

console.log('[tasks]: check assets');
if (!fs.existsSync(path.join(__dirname, '..', 'assets'))) {
  fs.mkdirSync(path.join(__dirname, '..', 'assets'));
  console.log('[tasks]: mkdir assets');
}

console.log('[tasks]: connect to DB');
AppDataSource.initialize()
  .then(async () => {
    try {
      console.log('[tasks]: "fill-db-global" started');
      await fillDB(AppDataSource);
      console.log('[tasks]: "fill-db-global" finished');
    } catch (error) {
      console.error(error);
    } finally {
      console.log('[tasks]: finished');
    }
  })
  .catch((error) => console.error(error));
