import { Express, Request, Response } from 'express';
import { DataSource } from 'typeorm';

import { IconCategory } from './../../entity/IconCategory';

const IconCategoryApi = function (app: Express, AppDataSource: DataSource) {
  const iconCategoriesRepo = AppDataSource.getRepository(IconCategory);

  app.get('/icon_category', async (req: Request, res: Response) => {
    try {
      const iconCategory = await iconCategoriesRepo.find();
      res.send({ status: 'done', result: iconCategory });
    } catch (error) {
      res.send({ status: 'error', result: error });
    }
  });

  app.get('/icon_category/:id', async (req: Request, res: Response) => {
    try {
      const itemCategory = await iconCategoriesRepo.findOneBy({ id: Number(req.params.id) });
      res.send({ status: 'done', result: itemCategory });
    } catch (error) {
      res.send({ status: 'error', result: error });
    }
  });

  app.post('/icon_category', async (req: Request, res: Response) => {
    if (req.body && req.body.name) {
      try {
        const iconCategory = await iconCategoriesRepo.find();
        const itemType = new IconCategory();
        itemType.id = (iconCategory[iconCategory.length - 1]?.id ?? -1) + 1;
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

  app.delete('/icon_category/:id', async (req: Request, res: Response) => {
    if (req.params && req.params.id) {
      try {
        await AppDataSource.createQueryBuilder()
          .delete()
          .from(IconCategory)
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

  app.patch('/icon_category/:id', async (req: Request, res: Response) => {
    if (req.params && req.params.id && req.body && req.body.name) {
      try {
        const id = Number(req.params.id);
        const data = req.body;
        await AppDataSource.createQueryBuilder()
          .update(IconCategory)
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

export default IconCategoryApi;
