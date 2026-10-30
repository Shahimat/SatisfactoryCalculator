import assert from 'node:assert/strict';
import { describe, it } from 'vitest';

import {
  parseClassList,
  parseEnumList,
  parseItemAmounts,
} from '../scripts/catalog/game-docs.ts';

describe('game docs parsing', () => {
  it('parses item amounts', () => {
    const value =
      '((ItemClass="/Script/Engine.BlueprintGeneratedClass\'/Game/FactoryGame/Resource/Parts/IronPlate/Desc_IronPlate.Desc_IronPlate_C\'",Amount=6),' +
      '(ItemClass="/Script/Engine.BlueprintGeneratedClass\'/Game/FactoryGame/Resource/Parts/IronScrew/Desc_IronScrew.Desc_IronScrew_C\'",Amount=12))';
    assert.deepEqual(parseItemAmounts(value), [
      { item: 'Desc_IronPlate_C', amount: 6 },
      { item: 'Desc_IronScrew_C', amount: 12 },
    ]);
  });

  it('parses class lists', () => {
    const value =
      '("/Game/FactoryGame/Buildable/Factory/ConstructorMk1/Build_ConstructorMk1.Build_ConstructorMk1_C",' +
      '"/Game/FactoryGame/Equipment/BuildGun/BP_BuildGun.BP_BuildGun_C")';
    assert.deepEqual(parseClassList(value), [
      'Build_ConstructorMk1_C',
      'BP_BuildGun_C',
    ]);
  });

  it('parses enum lists', () => {
    assert.deepEqual(parseEnumList('(RF_LIQUID,RF_GAS)'), [
      'RF_LIQUID',
      'RF_GAS',
    ]);
    assert.deepEqual(parseEnumList(''), []);
  });
});
