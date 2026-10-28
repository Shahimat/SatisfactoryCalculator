import type {
  Belt,
  BuildingKind,
  Catalog,
  CatalogBuilding,
  CatalogItem,
  CatalogRecipe,
  GeneratorFuel,
  ItemAmount,
  ItemForm,
  ItemKind,
  Localized,
  Pipe,
  SourceManifest,
} from './catalog.types.ts';
import {
  booleanField,
  type DocsClass,
  field,
  type GameDocs,
  iconPath,
  numberField,
  parseClassList,
  parseEnumList,
  parseItemAmounts,
} from './game-docs.ts';

const ITEM_GROUPS: Record<string, ItemKind> = {
  FGResourceDescriptor: 'resource',
  FGItemDescriptor: 'part',
  FGItemDescriptorBiomass: 'biomass',
  FGItemDescriptorNuclearFuel: 'nuclear',
  FGConsumableDescriptor: 'consumable',
  FGEquipmentDescriptor: 'equipment',
  FGAmmoTypeProjectile: 'ammo',
  FGAmmoTypeSpreadshot: 'ammo',
  FGAmmoTypeInstantHit: 'ammo',
  FGPowerShardDescriptor: 'power-shard',
  FGItemDescriptorPowerBoosterFuel: 'special',
};

const BUILDING_GROUPS: Record<string, BuildingKind> = {
  FGBuildableManufacturer: 'manufacturer',
  FGBuildableManufacturerVariablePower: 'manufacturer',
  FGBuildableResourceExtractor: 'extractor',
  FGBuildableWaterPump: 'extractor',
  FGBuildableFrackingExtractor: 'extractor',
  FGBuildableFrackingActivator: 'support',
  FGBuildableGeneratorFuel: 'generator',
  FGBuildableGeneratorNuclear: 'generator',
  FGBuildableGeneratorGeoThermal: 'generator',
};

const FORMS: Record<string, ItemForm> = {
  RF_SOLID: 'solid',
  RF_LIQUID: 'liquid',
  RF_GAS: 'gas',
};

/** Game stores fluids in litres; the catalog uses m³. */
const LITRES_PER_M3 = 1000;

const byId = <T extends { id: string }>(a: T, b: T): number =>
  a.id.localeCompare(b.id);

const group = (docs: GameDocs, name: string): DocsClass[] =>
  docs.get(name) ?? [];

const groups = (docs: GameDocs, names: Iterable<string>): DocsClass[] =>
  [...names].flatMap((name) => group(docs, name));

export const buildCatalog = (
  en: GameDocs,
  ru: GameDocs,
  version: string,
  manifest: SourceManifest,
): Catalog => {
  const ruNames = new Map<string, DocsClass>();
  for (const classes of ru.values()) {
    for (const docsClass of classes)
      ruNames.set(docsClass.ClassName, docsClass);
  }
  const localized = (docsClass: DocsClass, name: string): Localized => {
    const en = field(docsClass, name).replaceAll('\r\n', '\n');
    const ruClass = ruNames.get(docsClass.ClassName);
    const ru =
      ruClass && typeof ruClass[name] === 'string'
        ? (ruClass[name] as string)
        : en;
    return { en, ru: ru.replaceAll('\r\n', '\n') };
  };

  const itemClasses = new Map<
    string,
    { docsClass: DocsClass; kind: ItemKind }
  >();
  for (const [groupName, kind] of Object.entries(ITEM_GROUPS)) {
    for (const docsClass of group(en, groupName)) {
      itemClasses.set(docsClass.ClassName, { docsClass, kind });
    }
  }
  const formOf = (item: string): ItemForm => {
    const entry = itemClasses.get(item);
    if (!entry) throw new Error(`Unknown item ${item}`);
    const form = FORMS[field(entry.docsClass, 'mForm')];
    if (!form)
      throw new Error(
        `${item}: unsupported form ${field(entry.docsClass, 'mForm')}`,
      );
    return form;
  };
  const normalizeAmount = (item: string, amount: number): number =>
    formOf(item) === 'solid' ? amount : amount / LITRES_PER_M3;
  const amounts = (value: string): ItemAmount[] =>
    parseItemAmounts(value).map(({ item, amount }) => ({
      item,
      amount: normalizeAmount(item, amount),
    }));

  const buildingClasses = groups(en, Object.keys(BUILDING_GROUPS)).filter(
    (docsClass) => docsClass.ClassName !== 'Build_TreeGiftProducer_C',
  );
  const buildingKind = new Map<string, BuildingKind>();
  for (const [groupName, kind] of Object.entries(BUILDING_GROUPS)) {
    for (const docsClass of group(en, groupName))
      buildingKind.set(docsClass.ClassName, kind);
  }
  const manufacturers = new Set(
    buildingClasses
      .filter(
        (docsClass) => buildingKind.get(docsClass.ClassName) === 'manufacturer',
      )
      .map((docsClass) => docsClass.ClassName),
  );
  const variablePower = new Set(
    group(en, 'FGBuildableManufacturerVariablePower').map(
      (docsClass) => docsClass.ClassName,
    ),
  );

  const recipes: CatalogRecipe[] = group(en, 'FGRecipe').flatMap(
    (docsClass) => {
      const producers = parseClassList(field(docsClass, 'mProducedIn')).filter(
        (name) => manufacturers.has(name),
      );
      const [building] = producers;
      if (!building) return [];
      if (producers.length > 1) {
        throw new Error(
          `${docsClass.ClassName}: produced in several buildings`,
        );
      }
      const recipe: CatalogRecipe = {
        id: docsClass.ClassName,
        name: localized(docsClass, 'mDisplayName'),
        alternate: docsClass.ClassName.includes('_Alternate_'),
        building,
        cycleSeconds: numberField(docsClass, 'mManufactoringDuration'),
        inputs: amounts(field(docsClass, 'mIngredients')),
        outputs: amounts(field(docsClass, 'mProduct')),
      };
      if (variablePower.has(building)) {
        recipe.variablePowerMW = {
          constant: numberField(docsClass, 'mVariablePowerConsumptionConstant'),
          factor: numberField(docsClass, 'mVariablePowerConsumptionFactor'),
        };
      }
      return [recipe];
    },
  );

  const buildings: CatalogBuilding[] = buildingClasses.map((docsClass) => {
    const kind = buildingKind.get(docsClass.ClassName) ?? 'support';
    const building: CatalogBuilding = {
      id: docsClass.ClassName,
      name: localized(docsClass, 'mDisplayName'),
      kind,
      powerMW: numberField(docsClass, 'mPowerConsumption'),
      powerExponent: numberField(docsClass, 'mPowerConsumptionExponent'),
      minClock: numberField(docsClass, 'mMinPotential'),
      maxClock: booleanField(docsClass, 'mCanChangePotential') ? 2.5 : 1,
      somersloopSlots: somersloopSlots(docsClass),
      somersloopPowerExponent: numberField(
        docsClass,
        'mProductionBoostPowerConsumptionExponent',
      ),
    };
    if (docsClass['mEstimatedMaximumPowerConsumption'] !== undefined) {
      building.variablePowerMW = {
        min: numberField(docsClass, 'mEstimatedMininumPowerConsumption'),
        max: numberField(docsClass, 'mEstimatedMaximumPowerConsumption'),
      };
    }
    if (kind === 'extractor')
      building.extraction = extraction(docsClass, normalizeAmount);
    if (kind === 'generator') building.generation = generation(docsClass);
    return building;
  });

  const referenced = new Set<string>();
  for (const recipe of recipes) {
    for (const { item } of [...recipe.inputs, ...recipe.outputs])
      referenced.add(item);
  }
  for (const building of buildings) {
    for (const item of building.extraction?.resources ?? [])
      referenced.add(item);
    for (const fuel of building.generation?.fuels ?? []) {
      referenced.add(fuel.item);
      if (fuel.supplement) referenced.add(fuel.supplement);
      if (fuel.byproduct) referenced.add(fuel.byproduct.item);
    }
  }
  for (const docsClass of group(en, 'FGResourceDescriptor'))
    referenced.add(docsClass.ClassName);

  const items: CatalogItem[] = [...referenced].map((id) => {
    const entry = itemClasses.get(id);
    if (!entry) throw new Error(`Unknown item ${id}`);
    const { docsClass, kind } = entry;
    return {
      id,
      name: localized(docsClass, 'mDisplayName'),
      description: localized(docsClass, 'mDescription'),
      form: formOf(id),
      kind,
      energyMJ: numberField(docsClass, 'mEnergyValue'),
      sinkPoints: numberField(docsClass, 'mResourceSinkPoints'),
      icon: iconPath(field(docsClass, 'mSmallIcon')),
    };
  });

  const belts: Belt[] = group(en, 'FGBuildableConveyorBelt').map(
    (docsClass) => ({
      id: docsClass.ClassName,
      name: localized(docsClass, 'mDisplayName'),
      // mSpeed is the belt speed in game units; throughput is half of it per minute.
      itemsPerMinute: numberField(docsClass, 'mSpeed') / 2,
    }),
  );
  const pipes: Pipe[] = group(en, 'FGBuildablePipeline')
    .filter((docsClass) => !docsClass.ClassName.includes('NoIndicator'))
    .map((docsClass) => ({
      id: docsClass.ClassName,
      name: localized(docsClass, 'mDisplayName'),
      m3PerMinute: numberField(docsClass, 'mFlowLimit') * 60,
    }));

  return {
    schema: 1,
    version,
    game: { version: manifest.gameVersion, build: manifest.gameBuild },
    items: items.sort(byId),
    buildings: buildings.sort(byId),
    recipes: recipes.sort(byId),
    logistics: { belts: belts.sort(byId), pipes: pipes.sort(byId) },
  };
};

const somersloopSlots = (docsClass: DocsClass): number => {
  if (!booleanField(docsClass, 'mCanChangeProductionBoost')) return 0;
  const slots = numberField(docsClass, 'mProductionShardSlotSize');
  if (slots > 0) return slots;
  // The smelter is dumped with 0 slots although it takes one Somersloop in game;
  // the per-slot boost multiplier (1 / slots) still holds the real value.
  return Math.round(
    1 / numberField(docsClass, 'mProductionShardBoostMultiplier'),
  );
};

const extraction = (
  docsClass: DocsClass,
  normalizeAmount: (item: string, amount: number) => number,
): CatalogBuilding['extraction'] => {
  const forms = parseEnumList(field(docsClass, 'mAllowedResourceForms'))
    .map((form) => FORMS[form])
    .filter((form) => form !== undefined);
  const resources = parseClassList(field(docsClass, 'mAllowedResources'));
  const itemsPerCycle = numberField(docsClass, 'mItemsPerCycle');
  const amountPerCycle = forms.includes('solid')
    ? itemsPerCycle
    : normalizeAmount(resources[0] ?? 'Desc_Water_C', itemsPerCycle);
  return {
    cycleSeconds: numberField(docsClass, 'mExtractCycleTime'),
    amountPerCycle,
    forms,
    resources,
  };
};

const generation = (docsClass: DocsClass): CatalogBuilding['generation'] => {
  const rawFuels = (docsClass['mFuel'] ?? []) as Record<string, string>[];
  const fuels = rawFuels.map((raw): GeneratorFuel => {
    const fuel: GeneratorFuel = { item: raw['mFuelClass'] ?? '' };
    if (raw['mSupplementalResourceClass'])
      fuel.supplement = raw['mSupplementalResourceClass'];
    if (raw['mByproduct']) {
      fuel.byproduct = {
        item: raw['mByproduct'],
        amount: Number(raw['mByproductAmount']),
      };
    }
    return fuel;
  });
  return {
    powerMW: numberField(docsClass, 'mPowerProduction'),
    fuels,
    supplementM3PerMJ:
      docsClass['mSupplementalToPowerRatio'] === undefined
        ? 0
        : numberField(docsClass, 'mSupplementalToPowerRatio') / LITRES_PER_M3,
  };
};
