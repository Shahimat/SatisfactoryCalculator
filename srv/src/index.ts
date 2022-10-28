import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import { AppDataSource } from './data-source';
import { ItemType } from './entity/ItemType';

dotenv.config();

const app: Express = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

AppDataSource.initialize()
  .then(async () => {
    const typesRepo = AppDataSource.getRepository(ItemType);

    app.get('/type', async (req: Request, res: Response) => {
      try {
        const typeItems = await typesRepo.find();
        res.send({ status: 'done', result: typeItems });
      } catch (error) {
        res.send({ status: 'error', result: error });
      }
    });

    app.get('/type/:id', async (req: Request, res: Response) => {
      try {
        const typeItem = await typesRepo.findOneBy({ id: Number(req.params.id) });
        res.send({ status: 'done', result: typeItem });
      } catch (error) {
        res.send({ status: 'error', result: error });
      }
    });

    app.post('/type', async (req: Request, res: Response) => {
      if (req.body && req.body.name) {
        try {
          const typeItems = await typesRepo.find();
          const itemType = new ItemType();
          itemType.id = (typeItems[typeItems.length - 1]?.id ?? -1) + 1;
          itemType.name = req.body.name;
          await AppDataSource.manager.save(itemType);
          res.send({ status: 'done', result: itemType });
        } catch (error) {
          res.send({ status: 'error', result: error });
        }
      } else {
        res.send({ status: 'error', result: req.body });
      }
    });

    app.delete('/type/:id', async (req: Request, res: Response) => {
      if (req.params && req.params.id) {
        try {
          await AppDataSource.createQueryBuilder()
            .delete()
            .from(ItemType)
            .where('id = :id', { id: req.params.id })
            .execute();
          res.send({ status: 'done', result: req.params.id });
        } catch (error) {
          res.send({ status: 'error', result: error });
        }
      } else {
        res.send({ status: 'error', result: req.params });
      }
    });

    app.patch('/type/:id', async (req: Request, res: Response) => {
      if (req.params && req.params.id && req.body && req.body.name) {
        try {
          const id = Number(req.params.id);
          const data = req.body;
          await AppDataSource.createQueryBuilder()
            .update(ItemType)
            .set({ name: data.name })
            .where('id = :id', { id })
            .execute();
          res.send({ status: 'done', result: { id, name: data.name } });
        } catch (error) {
          res.send({ status: 'error', result: error });
        }
      } else {
        res.send({
          status: 'error',
          result: {
            params: req.params,
            body: req.body,
          },
        });
      }
    });

    app.listen(port, () => {
      console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
    });
  })
  .catch((error) => console.log(error));
