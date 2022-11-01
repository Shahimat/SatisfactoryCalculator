import path from 'path';
import fs from 'fs';
import { DataSource } from 'typeorm';
import fillDB from './fill-db-global';

import { ItemType } from '../src/item-type/item-type.entity';
// import { ItemCategory } from './entity/ItemCategory';
// import { IconCategory } from './entity/IconCategory';
// import { Icon } from './entity/Icon';
// import { Item } from './entity/Item';

const srvNestPath = path.join(__dirname, '..');

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './db/DB.sqlite',
  synchronize: true,
  logging: false,
  entities: [ItemType],
  // migrations: ['../**/*.migration.{js.ts}'],
  migrationsRun: false,
  subscribers: [],
});

console.log('⚡️[tasks]: check assets');
if (!fs.existsSync(path.join(srvNestPath, 'assets'))) {
  fs.mkdirSync(path.join(srvNestPath, 'assets'));
  console.log('⚡️[tasks]: mkdir assets');
}

console.log('⚡️[tasks]: connect to DB');
AppDataSource.initialize()
  .then(async () => {
    try {
      console.log('⚡️[tasks]: "fill-db-global" started');
      await fillDB(AppDataSource);
      console.log('⚡️[tasks]: "fill-db-global" finished');
    } catch (error) {
      console.error(error);
    } finally {
      console.log('⚡️[tasks]: finished');
    }
  })
  .catch((error) => console.error(error));
