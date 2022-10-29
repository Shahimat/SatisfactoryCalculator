import { DataSource } from 'typeorm';

import { ItemType } from './../src/entity/ItemType';
import { ItemCategory } from './../src/entity/ItemCategory';
import { IconCategory } from './../src/entity/IconCategory';
import { Icon } from './../src/entity/Icon';

const fillDB = async (AppDataSource: DataSource) => {
  await AppDataSource.createQueryBuilder().delete().from(Icon).execute();
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

  await AppDataSource.createQueryBuilder()
    .insert()
    .into(Icon)
    .values([
      { name: 'bauxite', path: './resource/Bauxite.webp', iconCategory: { id: 0 } },
      { name: 'caterium_ore', path: './resource/Caterium_Ore.webp', iconCategory: { id: 0 } },
      { name: 'copper_ore', path: './resource/Copper_ore.webp', iconCategory: { id: 0 } },
      { name: 'crude_oil', path: './resource/Crude_Oil.webp', iconCategory: { id: 0 } },
      { name: 'iron_ore', path: './resource/Iron_Ore.webp', iconCategory: { id: 0 } },
      { name: 'limestone', path: './resource/Limestone.webp', iconCategory: { id: 0 } },
      { name: 'nitrogen_gas', path: './resource/Nitrogen_Gas.webp', iconCategory: { id: 0 } },
      { name: 'raw_quartz', path: './resource/Raw_Quartz.webp', iconCategory: { id: 0 } },
      { name: 'sulfur', path: './resource/Sulfur.webp', iconCategory: { id: 0 } },
      { name: 'uranum', path: './resource/Uranum.webp', iconCategory: { id: 0 } },
      { name: 'water', path: './resource/Water.webp', iconCategory: { id: 0 } },
      { name: 'biomass', path: './fuel/Biomass.webp', iconCategory: { id: 1 } },
      { name: 'coal', path: './fuel/Coal.webp', iconCategory: { id: 1 } },
      { name: 'leaves', path: './fuel/Leaves.webp', iconCategory: { id: 1 } },
      { name: 'solid_biofuel', path: './fuel/Solid_Biofuel.webp', iconCategory: { id: 1 } },
      { name: 'wood', path: './fuel/Wood.webp', iconCategory: { id: 1 } },
      { name: 'cable', path: './component/Cable.webp', iconCategory: { id: 2 } },
      { name: 'concrete', path: './component/Concrete.webp', iconCategory: { id: 2 } },
      { name: 'copper_ignot', path: './component/Copper_Ignot.webp', iconCategory: { id: 2 } },
      { name: 'copper_sheet', path: './component/Copper_Sheet.webp', iconCategory: { id: 2 } },
      { name: 'iron_ignot', path: './component/Iron_Ignot.webp', iconCategory: { id: 2 } },
      { name: 'iron_plate', path: './component/Iron_Plate.webp', iconCategory: { id: 2 } },
      { name: 'iron_rod', path: './component/Iron_Rod.webp', iconCategory: { id: 2 } },
      { name: 'modular_frame', path: './component/Modular_Frame.webp', iconCategory: { id: 2 } },
      { name: 'reinforced_iron_plate', path: './component/Reinforced_Iron_Plate.webp', iconCategory: { id: 2 } },
      { name: 'rotor', path: './component/Rotor.webp', iconCategory: { id: 2 } },
      { name: 'screw', path: './component/Screw.webp', iconCategory: { id: 2 } },
      { name: 'smart_plating', path: './component/Smart_Plating.webp', iconCategory: { id: 2 } },
      { name: 'wire', path: './component/Wire.webp', iconCategory: { id: 2 } },
      { name: 'power_shard', path: './thing/Power_Shard.webp', iconCategory: { id: 3 } },
      { name: 'miner_mk_1', path: './miner/Miner_Mk.1.webp', iconCategory: { id: 4 } },
      { name: 'miner_mk_2', path: './miner/Miner_Mk.2.webp', iconCategory: { id: 4 } },
      { name: 'miner_mk_3', path: './miner/Miner_Mk.3.webp', iconCategory: { id: 4 } },
      { name: 'oil_extractor', path: './miner/oil_extractor.webp', iconCategory: { id: 4 } },
      { name: 'resource_well_pressurizer', path: './miner/Resource_Well_Pressurizer.webp', iconCategory: { id: 4 } },
      { name: 'water_extractor', path: './miner/Water_Extractor.webp', iconCategory: { id: 4 } },
      { name: 'assembler', path: './factory/Assembler.webp', iconCategory: { id: 5 } },
      { name: 'biomass_burner', path: './factory/Biomass_Burner.webp', iconCategory: { id: 5 } },
      { name: 'blender', path: './factory/Blender.webp', iconCategory: { id: 5 } },
      { name: 'coal_generator', path: './factory/Coal_Generator.webp', iconCategory: { id: 5 } },
      { name: 'constructor', path: './factory/Constructor.webp', iconCategory: { id: 5 } },
      { name: 'foundry', path: './factory/Foundry.webp', iconCategory: { id: 5 } },
      { name: 'fuel_generator', path: './factory/Fuel_Generator.webp', iconCategory: { id: 5 } },
      { name: 'Geothermal_Generator', path: './factory/Geothermal_Generator.webp', iconCategory: { id: 5 } },
      { name: 'manufacturer', path: './factory/Manufacturer.webp', iconCategory: { id: 5 } },
      { name: 'nuclear_power_plant', path: './factory/Nuclear_Power_Plant.webp', iconCategory: { id: 5 } },
      { name: 'packager', path: './factory/Packager.webp', iconCategory: { id: 5 } },
      { name: 'particle_accelerator', path: './factory/Particle_Accelerator.webp', iconCategory: { id: 5 } },
      { name: 'refinery', path: './factory/Refinery.webp', iconCategory: { id: 5 } },
      { name: 'smelter', path: './factory/Smelter.webp', iconCategory: { id: 5 } },
    ])
    .execute();
};

export default fillDB;
