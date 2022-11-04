import path from 'path';
import fs from 'fs';
import { DataSource } from 'typeorm';
import fillDB from './fill-db-global';

import { env } from '../src/config';

import { ItemType } from '../src/item-type/item-type.entity';
import { ItemCategory } from '../src/item-category/item-category.entity';
import { IconCategory } from '../src/icon-category/icon-category.entity';
import { Icon } from '../src/icon/icon.entity';
import { Item } from '../src/item/item.entity';
import { Factory } from '../src/factory/factory.entity';
import { Chain } from '../src/chain/chain.entity';

const srvNestPath = path.join(__dirname, '..');

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './db/DB.sqlite',
  synchronize: true,
  logging: false,
  entities: [ItemType, ItemCategory, IconCategory, Icon, Item, Factory, Chain],
  // migrations: ['../**/*.migration.{js.ts}'],
  migrationsRun: false,
  subscribers: [],
});

console.log('⚡️[tasks]: check assets');
if (!fs.existsSync(path.join(srvNestPath, env.ASSETS_DIR_NAME))) {
  fs.mkdirSync(path.join(srvNestPath, env.ASSETS_DIR_NAME));
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
