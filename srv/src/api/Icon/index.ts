import { Express, Request, Response } from 'express';
import { DataSource } from 'typeorm';

import { Icon } from './../../entity/Icon';
import { IconCategory } from './../../entity/IconCategory';

const iconApi = function (app: Express, AppDataSource: DataSource) {
  const iconRepo = AppDataSource.getRepository(Icon);
  const iconCategoryRepo = AppDataSource.getRepository(IconCategory);

  app.get('/icon', async (req: Request, res: Response) => {
    try {
      const icons = await iconRepo.find();
      res.send({ status: 'done', result: icons });
    } catch (error) {
      res.send({ status: 'error', result: error });
    }
  });

  app.get('/icon/:id', async (req: Request, res: Response) => {
    try {
      const icon = await iconRepo.findOneBy({ id: Number(req.params.id) });
      res.send({ status: 'done', result: icon });
    } catch (error) {
      res.send({ status: 'error', result: error });
    }
  });

  app.post('/icon', async (req: Request, res: Response) => {
    if (req.body && req.body.name && req.body.path && req.body.iconCategoryId) {
      try {
        const icons = await iconRepo.find();
        const iconCategory = await iconCategoryRepo.findOneBy({ id: Number(req.body.iconCategoryId) });
        if (iconCategory) {
          const icon = new Icon();
          icon.id = (icons[icons.length - 1]?.id ?? -1) + 1;
          icon.name = req.body.name;
          icon.path = req.body.path;
          icon.iconCategory = iconCategory;
          await AppDataSource.manager.save(icon);
          res.send({ status: 'done', result: icon });
        } else {
          res.send({
            status: 'error',
            message: `iconCategory by id = "${Number(req.body.iconCategoryId)}" not founded`,
            result: null,
          });
        }
      } catch (error) {
        res.send({ status: 'error', result: error });
      }
    } else {
      res.send({ status: 'error', message: 'expected "name", "path", "iconCategoryId"', result: req.body });
    }
  });

  app.delete('/icon/:id', async (req: Request, res: Response) => {
    if (req.params && req.params.id) {
      try {
        await AppDataSource.createQueryBuilder().delete().from(Icon).where('id = :id', { id: req.params.id }).execute();
        res.send({ status: 'done', result: req.params.id });
      } catch (error) {
        res.send({ status: 'error', result: error });
      }
    } else {
      res.send({ status: 'error', message: 'expected "id"', result: req.params });
    }
  });

  app.patch('/icon/:id', async (req: Request, res: Response) => {
    if (req.params && req.params.id && req.body && (req.body.name || req.body.path || req.body.iconCategoryId)) {
      try {
        const id = Number(req.params.id);
        const data = req.body;
        await AppDataSource.createQueryBuilder()
          .update(Icon)
          .set({ name: data.name, path: req.body.path, iconCategoryId: req.body.iconCategoryId })
          .where('id = :id', { id })
          .execute();
        res.send({
          status: 'done',
          result: { id, name: data.name, path: req.body.path, iconCategoryId: req.body.iconCategoryId },
        });
      } catch (error) {
        res.send({ status: 'error', result: error });
      }
    } else {
      res.send({
        status: 'error',
        message: 'expected "name" or "path" or "iconCategoryId"',
        result: {
          params: req.params,
          body: req.body,
        },
      });
    }
  });
};

export default iconApi;
