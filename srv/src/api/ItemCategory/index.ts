import { Express, Request, Response } from 'express';
import { DataSource } from 'typeorm';

import { ItemCategory } from './../../entity/ItemCategory';

const ItemCategoryApi = function (app: Express, AppDataSource: DataSource) {
  const categoriesRepo = AppDataSource.getRepository(ItemCategory);

  app.get('/category', async (req: Request, res: Response) => {
    try {
      const itemsCategory = await categoriesRepo.find();
      res.send({ status: 'done', result: itemsCategory });
    } catch (error) {
      res.send({ status: 'error', result: error });
    }
  });

  app.get('/category/:id', async (req: Request, res: Response) => {
    try {
      const itemCategory = await categoriesRepo.findOneBy({ id: Number(req.params.id) });
      res.send({ status: 'done', result: itemCategory });
    } catch (error) {
      res.send({ status: 'error', result: error });
    }
  });

  app.post('/category', async (req: Request, res: Response) => {
    if (req.body && req.body.name) {
      try {
        const itemsCategory = await categoriesRepo.find();
        const itemType = new ItemCategory();
        itemType.id = (itemsCategory[itemsCategory.length - 1]?.id ?? -1) + 1;
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

  app.delete('/category/:id', async (req: Request, res: Response) => {
    if (req.params && req.params.id) {
      try {
        await AppDataSource.createQueryBuilder()
          .delete()
          .from(ItemCategory)
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

  app.patch('/category/:id', async (req: Request, res: Response) => {
    if (req.params && req.params.id && req.body && req.body.name) {
      try {
        const id = Number(req.params.id);
        const data = req.body;
        await AppDataSource.createQueryBuilder()
          .update(ItemCategory)
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
};

export default ItemCategoryApi;
