import { DataSource } from 'typeorm';
import { ItemType } from './entity/ItemType';
import { ItemCategory } from './entity/ItemCategory';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './db/DB.sqlite',
  synchronize: true,
  logging: false,
  entities: [ItemType, ItemCategory],
  migrationsRun: false,
  subscribers: [],
});
