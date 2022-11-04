import { DataSource } from 'typeorm';

import { ItemType } from '../src/item-type/item-type.entity';
import { ItemCategory } from '../src/item-category/item-category.entity';
import { IconCategory } from '../src/icon-category/icon-category.entity';
import { Icon } from '../src/icon/icon.entity';
import { Item } from '../src/item/item.entity';
import { Factory } from '../src/factory/factory.entity';
import { Chain } from '../src/chain/chain.entity';
import { Plant } from '../src/plant/plant.entity';
import { Calculation } from '../src/calculation/calculation.entity';

import iconsData from './data/icons.json';
import itemsData from './data/items.json';
import factoriesData from './data/factories.json';

const fillDB = async (AppDataSource: DataSource) => {
  await AppDataSource.createQueryBuilder().delete().from(Calculation).execute();
  await AppDataSource.createQueryBuilder().delete().from(Plant).execute();
  await AppDataSource.createQueryBuilder().delete().from(Chain).execute();
  await AppDataSource.createQueryBuilder().delete().from(Factory).execute();
  await AppDataSource.createQueryBuilder().delete().from(Item).execute();
  await AppDataSource.createQueryBuilder().delete().from(Icon).execute();
  await AppDataSource.createQueryBuilder().delete().from(ItemType).execute();
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(ItemCategory)
    .execute();
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(IconCategory)
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(ItemType)
    .values([
      { id: 0, name: 'Твердое тело' },
      { id: 1, name: 'Жидкость' },
      { id: 2, name: 'Прочее' },
    ])
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(ItemCategory)
    .values([
      { id: 0, name: 'Ресурс', isInternalEnergy: false },
      { id: 1, name: 'Топливо', isInternalEnergy: true },
      { id: 2, name: 'Компонент', isInternalEnergy: false },
      { id: 3, name: 'Предмет', isInternalEnergy: false },
      { id: 4, name: 'Прочее', isInternalEnergy: false },
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

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Icon)
    .values(iconsData)
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Item)
    .values(itemsData)
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Factory)
    .values(factoriesData)
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Chain)
    .values([
      {
        id: 0,
      },
      { id: 1 },
    ])
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Plant)
    .values([
      {
        id: 0,
        name: 'завод',
      },
    ])
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Calculation)
    .values([
      {
        id: 0,
        name: 'расчет',
      },
    ])
    .execute();
};

export default fillDB;
