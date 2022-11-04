import { DataSource } from 'typeorm';

import { ItemType } from '../src/item-type/item-type.entity';
import { ItemCategory } from '../src/item-category/item-category.entity';
import { IconCategory } from '../src/icon-category/icon-category.entity';
import { Icon } from '../src/icon/icon.entity';
// import { Item } from './../src/entity/Item';

import iconsData from './data/icons.json';

const fillDB = async (AppDataSource: DataSource) => {
  // await AppDataSource.createQueryBuilder().delete().from(Item).execute();
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

  // await AppDataSource.createQueryBuilder()
  //   .insert()
  //   .into(Item)
  //   .values([
  //     {
  //       id: 0,
  //       name: 'Баксит',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 0 },
  //       icon: { id: 0 },
  //     },
  //     {
  //       id: 1,
  //       name: 'Катерийная руда',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 0 },
  //       icon: { id: 1 },
  //     },
  //     {
  //       id: 2,
  //       name: 'Медная руда',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 0 },
  //       icon: { id: 2 },
  //     },
  //     {
  //       id: 3,
  //       name: 'Сырая нефть',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 1 },
  //       icon: { id: 3 },
  //     },
  //     {
  //       id: 4,
  //       name: 'Железная руда',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 0 },
  //       icon: { id: 4 },
  //     },
  //     {
  //       id: 5,
  //       name: 'Известняк',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 0 },
  //       icon: { id: 5 },
  //     },
  //     {
  //       id: 6,
  //       name: 'Азот',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 1 },
  //       icon: { id: 6 },
  //     },
  //     {
  //       id: 7,
  //       name: 'Неограненный кварц',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 0 },
  //       icon: { id: 7 },
  //     },
  //     {
  //       id: 8,
  //       name: 'Сера',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 0 },
  //       icon: { id: 8 },
  //     },
  //     {
  //       id: 9,
  //       name: 'Уран',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 0 },
  //       icon: { id: 9 },
  //     },
  //     {
  //       id: 10,
  //       name: 'Вода',
  //       itemCategory: { id: 0 },
  //       itemType: { id: 1 },
  //       icon: { id: 10 },
  //     },
  //     {
  //       id: 11,
  //       name: 'Биомасса',
  //       itemCategory: { id: 1 },
  //       itemType: { id: 0 },
  //       icon: { id: 11 },
  //       energy: 180000000,
  //     },
  //     {
  //       id: 12,
  //       name: 'Уголь',
  //       itemCategory: { id: 1 },
  //       itemType: { id: 0 },
  //       icon: { id: 12 },
  //       energy: 300000000,
  //     },
  //     {
  //       id: 13,
  //       name: 'Листва',
  //       itemCategory: { id: 1 },
  //       itemType: { id: 0 },
  //       icon: { id: 13 },
  //       energy: 15000000,
  //     },
  //     {
  //       id: 14,
  //       name: 'Твердое биотопливо',
  //       itemCategory: { id: 1 },
  //       itemType: { id: 0 },
  //       icon: { id: 14 },
  //       energy: 450000000,
  //     },
  //     {
  //       id: 15,
  //       name: 'Древесина',
  //       itemCategory: { id: 1 },
  //       itemType: { id: 0 },
  //       icon: { id: 15 },
  //       energy: 100000000,
  //     },
  //     {
  //       id: 16,
  //       name: 'Кабель',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 16 },
  //     },
  //     {
  //       id: 17,
  //       name: 'Бетон',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 17 },
  //     },
  //     {
  //       id: 18,
  //       name: 'Медный слиток',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 18 },
  //     },
  //     {
  //       id: 19,
  //       name: 'Медный лист',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 19 },
  //     },
  //     {
  //       id: 20,
  //       name: 'Железный слиток',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 20 },
  //     },
  //     {
  //       id: 21,
  //       name: 'Железная пластина',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 21 },
  //     },
  //     {
  //       id: 22,
  //       name: 'Железный прут',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 22 },
  //     },
  //     {
  //       id: 23,
  //       name: 'Модульный каркас',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 23 },
  //     },
  //     {
  //       id: 24,
  //       name: 'Усиленная железная пластина',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 24 },
  //     },
  //     {
  //       id: 25,
  //       name: 'Ротор',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 25 },
  //     },
  //     {
  //       id: 26,
  //       name: 'Винты',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 26 },
  //     },
  //     {
  //       id: 27,
  //       name: 'Умная обшивка',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 27 },
  //     },
  //     {
  //       id: 28,
  //       name: 'Проволка',
  //       itemCategory: { id: 2 },
  //       itemType: { id: 0 },
  //       icon: { id: 28 },
  //     },
  // { id: 29, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 29 } },
  // { id: 30, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 30 } },
  // { id: 31, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 31 } },
  // { id: 32, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 32 } },
  // { id: 33, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 33 } },
  // { id: 34, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 34 } },
  // { id: 35, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 35 } },
  // { id: 36, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 36 } },
  // { id: 37, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 37 } },
  // { id: 38, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 38 } },
  // { id: 39, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 39 } },
  // { id: 40, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 40 } },
  // { id: 41, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 41 } },
  // { id: 42, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 42 } },
  // { id: 43, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 43 } },
  // { id: 44, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 44 } },
  // { id: 45, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 45 } },
  // { id: 46, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 46 } },
  // { id: 47, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 47 } },
  // { id: 48, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 48 } },
  // { id: 49, name: '', itemCategory: { id: 0 }, itemType: { id: 0 }, icon: { id: 49 } },
  // ])
  // .execute();
};

export default fillDB;
