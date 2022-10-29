import { DataSource } from 'typeorm';
import { ItemType } from './entity/ItemType';
import { ItemCategory } from './entity/ItemCategory';
import { IconCategory } from './entity/IconCategory';
import { Icon } from './entity/Icon';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './db/DB.sqlite',
  synchronize: true,
  logging: false,
  entities: [ItemType, ItemCategory, IconCategory, Icon],
  migrationsRun: false,
  subscribers: [],
});
