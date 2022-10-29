import express, { Express } from 'express';
import dotenv from 'dotenv';

import { AppDataSource } from './data-source';

import itemTypeApi from './api/itemType';
import itemCategoryApi from './api/ItemCategory';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

AppDataSource.initialize()
  .then(async () => {
    itemTypeApi(app, AppDataSource);
    itemCategoryApi(app, AppDataSource);

    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
    });
  })
  .catch((error) => console.error(error));
