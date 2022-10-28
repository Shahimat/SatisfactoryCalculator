import { DataSource } from 'typeorm';
import { ItemType } from './entity/ItemType';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './db/DB.sqlite',
  synchronize: true,
  logging: false,
  entities: [ItemType],
  migrationsRun: false,
  subscribers: [],
});
