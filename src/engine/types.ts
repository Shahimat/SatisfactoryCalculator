/** Fluid amounts are in m³, solid amounts in pieces. */
export type ItemAmount = { item: string; amount: number };

export type BuildingSpec = {
  id: string;
  powerMW: number;
  powerExponent: number;
  somersloopSlots: number;
  somersloopPowerExponent: number;
  /** Highest clock, 2.5 when the building takes power shards. */
  maxClock?: number;
  extraction?: { cycleSeconds: number; amountPerCycle: number };
  generation?: {
    powerMW: number;
    fuels: { item: string; supplement?: string; byproduct?: ItemAmount }[];
    supplementM3PerMJ: number;
  };
};

export type RecipeSpec = {
  id: string;
  building: string;
  cycleSeconds: number;
  inputs: ItemAmount[];
  outputs: ItemAmount[];
  variablePowerMW?: { constant: number; factor: number };
};

export type ItemSpec = { id: string; energyMJ: number; kind: string };

/**
 * Buildings with the same settings. `count` may be fractional: the last
 * building runs underclocked by the fraction.
 */
export type BuildingGroup = {
  count: number;
  /** 1 = 100%, range 0.01–2.5. */
  clock: number;
  /** Filled Somersloop slots per building. */
  somersloops: number;
};

export type Purity = 'impure' | 'normal' | 'pure';

/**
 * `auto`: the solver chooses the building count. `fixed`: building counts are
 * locked as entered and the other rows adapt to them.
 */
export type Sizing = 'auto' | 'fixed';

export type LockedOutput = { item: string; perMinute: number };

export type RecipeRow = {
  kind: 'recipe';
  id: string;
  recipe: string;
  groups: BuildingGroup[];
  sizing?: Sizing;
  /** Exact output of one product the row is locked at; other products follow. */
  output?: LockedOutput;
  /** Plain building count chosen by the user; the clock follows the needed output. */
  buildings?: number;
};

export type ExtractorRow = {
  kind: 'extractor';
  id: string;
  building: string;
  resource: string;
  purity: Purity;
  groups: BuildingGroup[];
  sizing?: Sizing;
  output?: LockedOutput;
  buildings?: number;
};

export type GeneratorRow = {
  kind: 'generator';
  id: string;
  building: string;
  fuel: string;
  groups: BuildingGroup[];
};

export type WorkshopRow = {
  kind: 'workshop';
  id: string;
  workshop: string;
  /** Whole copies, or a fraction when the last copy runs partly loaded. */
  copies: number;
  sizing?: Sizing;
};

export type PlantRow = {
  kind: 'plant';
  id: string;
  calculation: string;
  /** Whole copies, or a fraction when the last copy runs partly loaded. */
  copies: number;
  sizing?: Sizing;
};

export type Row =
  | RecipeRow
  | ExtractorRow
  | GeneratorRow
  | WorkshopRow
  | PlantRow;

/** Per-minute flows: negative is consumed, positive is produced. Power: negative is consumed. */
export type Flows = {
  items: Map<string, number>;
  /** Net power: generation minus consumption. */
  powerMW: number;
  generationMW: number;
  buildings: number;
  somersloops: number;
};

export type CalcContext = {
  recipe: (id: string) => RecipeSpec | undefined;
  building: (id: string) => BuildingSpec | undefined;
  item: (id: string) => ItemSpec | undefined;
  workshopRows: (id: string) => Row[] | undefined;
  calculationRows: (id: string) => Row[] | undefined;
};
