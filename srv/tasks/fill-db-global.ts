import { DataSource } from 'typeorm';

import { ItemType } from './../src/entity/ItemType';

const fillDB = async (AppDataSource: DataSource) => {
  await AppDataSource.createQueryBuilder().delete().from(ItemType).execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(ItemType)
    .values([
      { id: 0, name: 'Твердое тело' },
      { id: 1, name: 'Жидкость' },
    ])
    .execute();
};

export default fillDB;
