import { DataSource } from 'typeorm';
import { ItemType } from './entity/ItemType';
import { CategoryItem } from './entity/CategoryItem';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './db/DB.sqlite',
  synchronize: true,
  logging: false,
  entities: [ItemType, CategoryItem],
  migrationsRun: false,
  subscribers: [],
});
