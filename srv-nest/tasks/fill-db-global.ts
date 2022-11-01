import { DataSource } from 'typeorm';

import { ItemType } from '../src/item-type/item-type.entity';
import { ItemCategory } from '../src/item-category/item-category.entity';
// import { IconCategory } from './../src/entity/IconCategory';
// import { Icon } from './../src/entity/Icon';
// import { Item } from './../src/entity/Item';

const fillDB = async (AppDataSource: DataSource) => {
  // await AppDataSource.createQueryBuilder().delete().from(Item).execute();
  // await AppDataSource.createQueryBuilder().delete().from(Icon).execute();
  await AppDataSource.createQueryBuilder().delete().from(ItemType).execute();
  await AppDataSource.createQueryBuilder()
    .delete()
    .from(ItemCategory)
    .execute();
  // await AppDataSource.createQueryBuilder().delete().from(IconCategory).execute();

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

  // await AppDataSource.createQueryBuilder()
  //   .insert()
  //   .into(IconCategory)
  //   .values([
  //     { id: 0, name: 'Ресурс' },
  //     { id: 1, name: 'Топливо' },
  //     { id: 2, name: 'Компонент' },
  //     { id: 3, name: 'Предмет' },
  //     { id: 4, name: 'Добытчик' },
  //     { id: 5, name: 'Фабрика' },
  //     { id: 6, name: 'Прочее' },
  //   ])
  //   .execute();
  // await AppDataSource.createQueryBuilder()
  //   .insert()
  //   .into(Icon)
  //   .values([
  //     {
  //       id: 0,
  //       name: 'bauxite',
  //       path: './resource/Bauxite.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 1,
  //       name: 'caterium_ore',
  //       path: './resource/Caterium_Ore.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 2,
  //       name: 'copper_ore',
  //       path: './resource/Copper_ore.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 3,
  //       name: 'crude_oil',
  //       path: './resource/Crude_Oil.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 4,
  //       name: 'iron_ore',
  //       path: './resource/Iron_Ore.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 5,
  //       name: 'limestone',
  //       path: './resource/Limestone.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 6,
  //       name: 'nitrogen_gas',
  //       path: './resource/Nitrogen_Gas.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 7,
  //       name: 'raw_quartz',
  //       path: './resource/Raw_Quartz.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 8,
  //       name: 'sulfur',
  //       path: './resource/Sulfur.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 9,
  //       name: 'uranum',
  //       path: './resource/Uranum.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 10,
  //       name: 'water',
  //       path: './resource/Water.webp',
  //       iconCategory: { id: 0 },
  //     },
  //     {
  //       id: 11,
  //       name: 'biomass',
  //       path: './fuel/Biomass.webp',
  //       iconCategory: { id: 1 },
  //     },
  //     {
  //       id: 12,
  //       name: 'coal',
  //       path: './fuel/Coal.webp',
  //       iconCategory: { id: 1 },
  //     },
  //     {
  //       id: 13,
  //       name: 'leaves',
  //       path: './fuel/Leaves.webp',
  //       iconCategory: { id: 1 },
  //     },
  //     {
  //       id: 14,
  //       name: 'solid_biofuel',
  //       path: './fuel/Solid_Biofuel.webp',
  //       iconCategory: { id: 1 },
  //     },
  //     {
  //       id: 15,
  //       name: 'wood',
  //       path: './fuel/Wood.webp',
  //       iconCategory: { id: 1 },
  //     },
  //     {
  //       id: 16,
  //       name: 'cable',
  //       path: './component/Cable.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 17,
  //       name: 'concrete',
  //       path: './component/Concrete.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 18,
  //       name: 'copper_ignot',
  //       path: './component/Copper_Ignot.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 19,
  //       name: 'copper_sheet',
  //       path: './component/Copper_Sheet.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 20,
  //       name: 'iron_ignot',
  //       path: './component/Iron_Ignot.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 21,
  //       name: 'iron_plate',
  //       path: './component/Iron_Plate.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 22,
  //       name: 'iron_rod',
  //       path: './component/Iron_Rod.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 23,
  //       name: 'modular_frame',
  //       path: './component/Modular_Frame.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 24,
  //       name: 'reinforced_iron_plate',
  //       path: './component/Reinforced_Iron_Plate.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 25,
  //       name: 'rotor',
  //       path: './component/Rotor.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 26,
  //       name: 'screw',
  //       path: './component/Screw.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 27,
  //       name: 'smart_plating',
  //       path: './component/Smart_Plating.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 28,
  //       name: 'wire',
  //       path: './component/Wire.webp',
  //       iconCategory: { id: 2 },
  //     },
  //     {
  //       id: 29,
  //       name: 'power_shard',
  //       path: './thing/Power_Shard.webp',
  //       iconCategory: { id: 3 },
  //     },
  //     {
  //       id: 30,
  //       name: 'miner_mk_1',
  //       path: './miner/Miner_Mk.1.webp',
  //       iconCategory: { id: 4 },
  //     },
  //     {
  //       id: 31,
  //       name: 'miner_mk_2',
  //       path: './miner/Miner_Mk.2.webp',
  //       iconCategory: { id: 4 },
  //     },
  //     {
  //       id: 32,
  //       name: 'miner_mk_3',
  //       path: './miner/Miner_Mk.3.webp',
  //       iconCategory: { id: 4 },
  //     },
  //     {
  //       id: 33,
  //       name: 'oil_extractor',
  //       path: './miner/oil_extractor.webp',
  //       iconCategory: { id: 4 },
  //     },
  //     {
  //       id: 34,
  //       name: 'resource_well_pressurizer',
  //       path: './miner/Resource_Well_Pressurizer.webp',
  //       iconCategory: { id: 4 },
  //     },
  //     {
  //       id: 35,
  //       name: 'water_extractor',
  //       path: './miner/Water_Extractor.webp',
  //       iconCategory: { id: 4 },
  //     },
  //     {
  //       id: 36,
  //       name: 'assembler',
  //       path: './factory/Assembler.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 37,
  //       name: 'biomass_burner',
  //       path: './factory/Biomass_Burner.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 38,
  //       name: 'blender',
  //       path: './factory/Blender.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 39,
  //       name: 'coal_generator',
  //       path: './factory/Coal_Generator.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 40,
  //       name: 'constructor',
  //       path: './factory/Constructor.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 41,
  //       name: 'foundry',
  //       path: './factory/Foundry.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 42,
  //       name: 'fuel_generator',
  //       path: './factory/Fuel_Generator.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 43,
  //       name: 'Geothermal_Generator',
  //       path: './factory/Geothermal_Generator.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 44,
  //       name: 'manufacturer',
  //       path: './factory/Manufacturer.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 45,
  //       name: 'nuclear_power_plant',
  //       path: './factory/Nuclear_Power_Plant.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 46,
  //       name: 'packager',
  //       path: './factory/Packager.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 47,
  //       name: 'particle_accelerator',
  //       path: './factory/Particle_Accelerator.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 48,
  //       name: 'refinery',
  //       path: './factory/Refinery.webp',
  //       iconCategory: { id: 5 },
  //     },
  //     {
  //       id: 49,
  //       name: 'smelter',
  //       path: './factory/Smelter.webp',
  //       iconCategory: { id: 5 },
  //     },
  //   ])
  //   .execute();
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
