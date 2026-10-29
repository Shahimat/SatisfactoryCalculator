export type Localized = { en: string; ru: string };

export type ItemForm = 'solid' | 'liquid' | 'gas';

export type ItemKind =
  | 'resource'
  | 'part'
  | 'biomass'
  | 'nuclear'
  | 'consumable'
  | 'equipment'
  | 'ammo'
  | 'power-shard'
  | 'special';

/** Fluid amounts are in m³, solid amounts in pieces. */
export type ItemAmount = { item: string; amount: number };

export type CatalogItem = {
  id: string;
  name: Localized;
  description: Localized;
  form: ItemForm;
  kind: ItemKind;
  /** MJ per piece, or per m³ for fluids. */
  energyMJ: number;
  sinkPoints: number;
  icon: string;
};

export type CatalogRecipe = {
  id: string;
  name: Localized;
  alternate: boolean;
  building: string;
  cycleSeconds: number;
  inputs: ItemAmount[];
  outputs: ItemAmount[];
  /** Only for variable-power buildings: power ranges from constant to constant + factor during a cycle. */
  variablePowerMW?: { constant: number; factor: number };
};

export type BuildingKind =
  | 'manufacturer'
  | 'extractor'
  | 'generator'
  | 'support';

export type GeneratorFuel = {
  item: string;
  supplement?: string;
  byproduct?: ItemAmount;
};

export type CatalogBuilding = {
  id: string;
  name: Localized;
  kind: BuildingKind;
  powerMW: number;
  powerExponent: number;
  minClock: number;
  maxClock: number;
  somersloopSlots: number;
  somersloopPowerExponent: number;
  /** What one building costs to build with the build gun. */
  buildCost?: ItemAmount[];
  variablePowerMW?: { min: number; max: number };
  extraction?: {
    cycleSeconds: number;
    amountPerCycle: number;
    forms: ItemForm[];
    /** Empty means any resource of the allowed forms. */
    resources: string[];
  };
  generation?: {
    powerMW: number;
    fuels: GeneratorFuel[];
    supplementM3PerMJ: number;
  };
};

export type Belt = { id: string; name: Localized; itemsPerMinute: number };
export type Pipe = { id: string; name: Localized; m3PerMinute: number };

export type SourceManifest = {
  gameVersion: string;
  gameBuild: string;
  branch: string;
  files: Record<string, string>;
};

export type Catalog = {
  schema: 1;
  version: string;
  game: { version: string; build: string };
  items: CatalogItem[];
  buildings: CatalogBuilding[];
  recipes: CatalogRecipe[];
  logistics: { belts: Belt[]; pipes: Pipe[] };
};
