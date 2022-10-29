import { DataSource } from 'typeorm';

import { ItemType } from './../src/entity/ItemType';
import { ItemCategory } from './../src/entity/ItemCategory';
import { IconCategory } from './../src/entity/IconCategory';

const fillDB = async (AppDataSource: DataSource) => {
  await AppDataSource.createQueryBuilder().delete().from(ItemType).execute();
  await AppDataSource.createQueryBuilder().delete().from(ItemCategory).execute();
  await AppDataSource.createQueryBuilder().delete().from(IconCategory).execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(ItemType)
    .values([
      { id: 0, name: 'Твердое тело' },
      { id: 1, name: 'Жидкость' },
    ])
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(ItemCategory)
    .values([
      { id: 0, name: 'Ресурс' },
      { id: 1, name: 'Топливо' },
      { id: 2, name: 'Предмет' },
      { id: 3, name: 'Прочее' },
    ])
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(IconCategory)
    .values([
      { id: 0, name: 'Ресурс' },
      { id: 1, name: 'Топливо' },
      { id: 2, name: 'Компонент' },
      { id: 3, name: 'Предмет' },
      { id: 4, name: 'Добытчик' },
      { id: 5, name: 'Фабрика' },
      { id: 6, name: 'Прочее' },
    ])
    .execute();
};

export default fillDB;
