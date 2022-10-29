import path from 'path';
import express, { Express } from 'express';
import dotenv from 'dotenv';

import { AppDataSource } from './data-source';

import itemTypeApi from './api/itemType';
import itemCategoryApi from './api/ItemCategory';
import IconCategoryApi from './api/IconCategory';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

AppDataSource.initialize()
  .then(async () => {
    itemTypeApi(app, AppDataSource);
    itemCategoryApi(app, AppDataSource);
    IconCategoryApi(app, AppDataSource);

    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
    });
  })
  .catch((error) => console.error(error));
