import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import { AppDataSource } from './data-source';
import { ItemType } from './entity/ItemType';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

AppDataSource.initialize()
  .then(async () => {
    app.get('/', async (req: Request, res: Response) => {
      const types = await AppDataSource.manager.find(ItemType);
      res.send(types);
    });

    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
