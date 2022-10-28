import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../src/data-source';

console.log('[tasks]: started');

const clearDB = fs.readFileSync(path.join(__dirname, 'clear-db-global.sql'), 'utf-8');
console.log('[tasks]: clearDB file read');
const fillDB = fs.readFileSync(path.join(__dirname, 'fill-db-global.sql'), 'utf-8');
console.log('[tasks]: fillDB file read');

console.log('[tasks]: connect to DB');
AppDataSource.initialize()
  .then(async () => {
    try {
      console.log('[tasks]: "clear-db-global" started');
      await AppDataSource.manager.query(clearDB);
      console.log('[tasks]: "clear-db-global" finished');
      console.log('[tasks]: "fill-db-global" started');
      await AppDataSource.manager.query(fillDB);
      console.log('[tasks]: "fill-db-global" finished');
    } catch (error) {
      console.error(error);
    } finally {
      console.log('[tasks]: finished');
    }
  })
  .catch((error) => console.error(error));
