import { DataSource } from 'typeorm';

import { ItemType } from '../src/item-type/item-type.entity';
import { ItemCategory } from '../src/item-category/item-category.entity';
import { IconCategory } from '../src/icon-category/icon-category.entity';
import { Icon } from '../src/icon/icon.entity';
import { Item } from '../src/item/item.entity';
import { Factory } from '../src/factory/factory.entity';
import { Scheme } from '../src/scheme/scheme.entity';
import { SchemeItemLink } from '../src/scheme-item-link/scheme-item-link.entity';
import { Calculation } from '../src/calculation/calculation.entity';
import { CalculationCategory } from '../src/calculation/calculation-category.entity';
import { CalculationLink } from '../src/calculation/calculation-link.entity';
import { CalculationSchemeLink } from '../src/calculation/calculation-scheme-link.entity';

import iconsData from './data/icons.json';
import itemsData from './data/items.json';
import factoriesData from './data/factories.json';
import schemesData from './data/schemes.json';
import schemeItemLinksData from './data/scheme-item-links.json';

const fillDB = async (AppDataSource: DataSource) => {
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(CalculationSchemeLink)
    .execute();
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(CalculationLink)
    .execute();
  await AppDataSource.createQueryBuilder().delete().from(Calculation).execute();
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(CalculationCategory)
    .execute();
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(SchemeItemLink)
    .execute();
  await AppDataSource.createQueryBuilder().delete().from(Scheme).execute();
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
    .into(Scheme)
    .values(schemesData)
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(SchemeItemLink)
    .values(schemeItemLinksData)
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(CalculationCategory)
    .values([
      {
        id: 0,
        name: 'Калькулятор',
      },
      {
        id: 1,
        name: 'Завод',
      },
      {
        id: 2,
        name: 'Цепь',
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
        calculationCategory: { id: 0 },
      },
      {
        id: 1,
        name: 'мой завод',
        calculationCategory: { id: 1 },
      },
      {
        id: 2,
        name: 'цепь',
        calculationCategory: { id: 2 },
      },
    ])
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(CalculationSchemeLink)
    .values([
      {
        id: 0,
        acceleration: 1,
        num_factories: 1,
        calculation: { id: 0 },
        scheme: { id: 0 },
      },
      {
        id: 1,
        acceleration: 1,
        num_factories: 1,
        calculation: { id: 1 },
        scheme: { id: 0 },
      },
      {
        id: 2,
        acceleration: 1,
        num_factories: 1,
        calculation: { id: 2 },
        scheme: { id: 0 },
      },
    ])
    .execute();

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(CalculationLink)
    .values([
      {
        id: 0,
        calculationAggregation: { id: 0 },
        calculationLink: { id: 1 },
        num_calculations: 1,
      },
      {
        id: 1,
        calculationAggregation: { id: 0 },
        calculationLink: { id: 2 },
        num_calculations: 1,
      },
    ])
    .execute();
};

export default fillDB;
