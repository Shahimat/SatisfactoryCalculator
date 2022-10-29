import { DataSource } from 'typeorm';

import { ItemType } from './../src/entity/ItemType';
import { CategoryItem } from './../src/entity/CategoryItem';

const fillDB = async (AppDataSource: DataSource) => {
  await AppDataSource.createQueryBuilder().delete().from(ItemType).execute();
  await AppDataSource.createQueryBuilder().delete().from(CategoryItem).execute();

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
    .into(CategoryItem)
    .values([
      { id: 0, name: 'Ресурс' },
      { id: 1, name: 'Топливо' },
      { id: 2, name: 'Предмет' },
      { id: 3, name: 'Прочее' },
    ])
    .execute();
};

export default fillDB;
