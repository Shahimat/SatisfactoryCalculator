import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, it } from 'node:test';

import { buildVersion, DATA_DIR, readManifest } from '../src/build-catalog.ts';
import type { CatalogBuilding, CatalogRecipe } from '../src/catalog.types.ts';

const catalog = buildVersion('1.2');

const recipe = (id: string): CatalogRecipe => {
  const found = catalog.recipes.find((r) => r.id === id);
  assert.ok(found, id);
  return found;
};

const building = (id: string): CatalogBuilding => {
  const found = catalog.buildings.find((b) => b.id === id);
  assert.ok(found, id);
  return found;
};

describe('catalog 1.2', () => {
  it('carries the game version from source.json', () => {
    assert.equal(catalog.version, '1.2');
    assert.deepEqual(catalog.game, { version: '1.2.4.1', build: '513885' });
  });

  it('keeps recipes per cycle', () => {
    assert.deepEqual(recipe('Recipe_IronPlate_C'), {
      id: 'Recipe_IronPlate_C',
      name: { en: 'Iron Plate', ru: 'Железная пластина' },
      alternate: false,
      building: 'Build_ConstructorMk1_C',
      cycleSeconds: 6,
      inputs: [{ item: 'Desc_IronIngot_C', amount: 3 }],
      outputs: [{ item: 'Desc_IronPlate_C', amount: 2 }],
    });
  });

  it('converts fluid amounts to m³', () => {
    const plastic = recipe('Recipe_Plastic_C');
    assert.deepEqual(plastic.inputs, [{ item: 'Desc_LiquidOil_C', amount: 3 }]);
    assert.deepEqual(plastic.outputs, [
      { item: 'Desc_Plastic_C', amount: 2 },
      { item: 'Desc_HeavyOilResidue_C', amount: 1 },
    ]);
  });

  it('marks alternate recipes', () => {
    const pureIron = recipe('Recipe_Alternate_PureIronIngot_C');
    assert.equal(pureIron.alternate, true);
    assert.equal(pureIron.building, 'Build_OilRefinery_C');
    assert.equal(catalog.recipes.filter((r) => r.alternate).length, 110);
  });

  it('adds variable power only to variable-power buildings', () => {
    assert.equal(recipe('Recipe_IronPlate_C').variablePowerMW, undefined);
    const accelerated = catalog.recipes.filter(
      (r) => r.building === 'Build_HadronCollider_C',
    );
    assert.ok(accelerated.length > 0);
    for (const r of accelerated) assert.ok(r.variablePowerMW, r.id);
  });

  it('takes building power and overclock from the game', () => {
    assert.equal(building('Build_ConstructorMk1_C').powerMW, 4);
    assert.equal(building('Build_FoundryMk1_C').powerMW, 16);
    assert.equal(building('Build_OilRefinery_C').powerMW, 30);
    assert.equal(building('Build_ManufacturerMk1_C').powerMW, 55);
    assert.equal(building('Build_ConstructorMk1_C').powerExponent, 1.321929);
    assert.equal(building('Build_ConstructorMk1_C').maxClock, 2.5);
    assert.equal(building('Build_GeneratorGeoThermal_C').maxClock, 1);
  });

  it('has the build gun cost of every building', () => {
    assert.deepEqual(building('Build_ConstructorMk1_C').buildCost, [
      { item: 'Desc_IronPlateReinforced_C', amount: 2 },
      { item: 'Desc_Cable_C', amount: 8 },
    ]);
    for (const b of catalog.buildings) assert.ok(b.buildCost?.length, b.id);
    for (const b of catalog.buildings)
      for (const { item } of b.buildCost ?? [])
        assert.ok(
          catalog.items.some((i) => i.id === item),
          item,
        );
  });

  it('lists Somersloops and power shards as items', () => {
    for (const id of ['Desc_WAT1_C', 'Desc_CrystalShard_C'])
      assert.ok(
        catalog.items.some((i) => i.id === id),
        id,
      );
  });

  it('has Somersloop slots as in game', () => {
    const slots = Object.fromEntries(
      catalog.buildings
        .filter((b) => b.somersloopSlots > 0)
        .map((b) => [b.id, b.somersloopSlots]),
    );
    assert.deepEqual(slots, {
      Build_AssemblerMk1_C: 2,
      Build_Blender_C: 4,
      Build_ConstructorMk1_C: 1,
      Build_Converter_C: 2,
      Build_FoundryMk1_C: 2,
      Build_HadronCollider_C: 4,
      Build_ManufacturerMk1_C: 4,
      Build_OilRefinery_C: 2,
      Build_QuantumEncoder_C: 4,
      Build_SmelterMk1_C: 1,
    });
  });

  it('describes extraction in pieces or m³ per cycle', () => {
    assert.deepEqual(building('Build_MinerMk1_C').extraction, {
      cycleSeconds: 1,
      amountPerCycle: 1,
      forms: ['solid'],
      resources: [],
    });
    assert.deepEqual(building('Build_WaterPump_C').extraction, {
      cycleSeconds: 1,
      amountPerCycle: 2,
      forms: ['liquid'],
      resources: ['Desc_Water_C'],
    });
  });

  it('describes generators with fuels and water', () => {
    const coal = building('Build_GeneratorCoal_C').generation;
    assert.equal(coal?.powerMW, 75);
    assert.equal(coal?.supplementM3PerMJ, 0.01);
    assert.ok(
      coal?.fuels.some(
        (f) => f.item === 'Desc_Coal_C' && f.supplement === 'Desc_Water_C',
      ),
    );
  });

  it('has belt and pipe throughput', () => {
    assert.deepEqual(
      catalog.logistics.belts.map((b) => b.itemsPerMinute),
      [60, 120, 270, 480, 780, 1200],
    );
    assert.deepEqual(
      catalog.logistics.pipes.map((p) => p.m3PerMinute),
      [300, 600],
    );
  });

  it('lists every referenced item', () => {
    const ids = new Set(catalog.items.map((i) => i.id));
    for (const r of catalog.recipes) {
      for (const { item } of [...r.inputs, ...r.outputs])
        assert.ok(ids.has(item), item);
    }
    assert.equal(
      catalog.items.find((i) => i.id === 'Desc_Water_C')?.form,
      'liquid',
    );
  });
});

describe('source manifest', () => {
  it('rejects raw files that do not match source.json', () => {
    const dir = mkdtempSync(path.join(tmpdir(), 'catalog-'));
    copyFileSync(
      path.join(DATA_DIR, 'raw/1.2/source.json'),
      path.join(dir, 'source.json'),
    );
    writeFileSync(path.join(dir, 'en-US.json'), 'tampered');
    writeFileSync(path.join(dir, 'ru.json'), 'tampered');
    assert.throws(() => readManifest(dir), /does not match source\.json/);
  });
});
