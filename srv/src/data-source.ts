import path from 'path';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ItemType } from './entity/ItemType';

const migrationsPath = process.env.MIGRATIONS_PATH;

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: './db/DB.sqlite',
  synchronize: true,
  logging: false,
  entities: [ItemType],
  migrations: [`${migrationsPath}/**/*.{js,ts}`],
  migrationsRun: false,
  subscribers: [],
});
