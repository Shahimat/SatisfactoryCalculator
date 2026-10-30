import { describe, expect, it } from 'vitest';
import {
  amplification,
  balance,
  buildingPowerMW,
  type BuildingSpec,
  type CalcContext,
  carriers,
  groupPowerMW,
  groupsForTarget,
  type ItemSpec,
  minimize,
  recipeChanges,
  recipeSignature,
  type RecipeSpec,
  type Row,
  rowFlows,
  rowForOutput,
  rowsFlows,
  solveRows,
  solveSequential,
} from '../src/engine';

const manufacturer = (
  id: string,
  powerMW: number,
  somersloopSlots: number,
): BuildingSpec => ({
  id,
  powerMW,
  powerExponent: 1.321929,
  somersloopSlots,
  somersloopPowerExponent: 2,
});

const buildings: BuildingSpec[] = [
  manufacturer('Build_ConstructorMk1_C', 4, 1),
  manufacturer('Build_SmelterMk1_C', 4, 1),
  manufacturer('Build_HadronCollider_C', 0, 4),
  {
    ...manufacturer('Build_MinerMk2_C', 15, 0),
    extraction: { cycleSeconds: 0.5, amountPerCycle: 1 },
  },
  {
    ...manufacturer('Build_WaterPump_C', 20, 0),
    extraction: { cycleSeconds: 1, amountPerCycle: 2 },
  },
  manufacturer('Build_OilRefinery_C', 30, 2),
  {
    ...manufacturer('Build_GeneratorCoal_C', 0, 0),
    generation: {
      powerMW: 75,
      fuels: [{ item: 'Desc_Coal_C', supplement: 'Desc_Water_C' }],
      supplementM3PerMJ: 0.01,
    },
  },
  {
    ...manufacturer('Build_GeneratorNuclear_C', 0, 0),
    generation: {
      powerMW: 2500,
      fuels: [
        {
          item: 'Desc_NuclearFuelRod_C',
          supplement: 'Desc_Water_C',
          byproduct: { item: 'Desc_NuclearWaste_C', amount: 50 },
        },
      ],
      supplementM3PerMJ: 0.0016,
    },
  },
];

const recipes: RecipeSpec[] = [
  {
    id: 'Recipe_IronIngot_C',
    building: 'Build_SmelterMk1_C',
    cycleSeconds: 2,
    inputs: [{ item: 'Desc_OreIron_C', amount: 1 }],
    outputs: [{ item: 'Desc_IronIngot_C', amount: 1 }],
  },
  {
    id: 'Recipe_IronPlate_C',
    building: 'Build_ConstructorMk1_C',
    cycleSeconds: 6,
    inputs: [{ item: 'Desc_IronIngot_C', amount: 3 }],
    outputs: [{ item: 'Desc_IronPlate_C', amount: 2 }],
  },
  {
    id: 'Recipe_PlutoniumCell_C',
    building: 'Build_HadronCollider_C',
    cycleSeconds: 60,
    inputs: [],
    outputs: [{ item: 'Desc_PlutoniumCell_C', amount: 10 }],
    variablePowerMW: { constant: 250, factor: 500 },
  },
];

// A loop in the spirit of aluminium: water goes in, part of it comes back.
recipes.push(
  {
    id: 'Recipe_Solution_C',
    building: 'Build_OilRefinery_C',
    cycleSeconds: 60,
    inputs: [
      { item: 'Desc_Bauxite_C', amount: 1 },
      { item: 'Desc_Water_C', amount: 3 },
    ],
    outputs: [{ item: 'Desc_Solution_C', amount: 2 }],
  },
  {
    id: 'Recipe_Scrap_C',
    building: 'Build_OilRefinery_C',
    cycleSeconds: 60,
    inputs: [{ item: 'Desc_Solution_C', amount: 1 }],
    outputs: [
      { item: 'Desc_Scrap_C', amount: 1 },
      { item: 'Desc_Water_C', amount: 1 },
    ],
  },
  {
    id: 'Recipe_ToA_C',
    building: 'Build_OilRefinery_C',
    cycleSeconds: 60,
    inputs: [{ item: 'Desc_B_C', amount: 1 }],
    outputs: [{ item: 'Desc_A_C', amount: 1 }],
  },
  {
    id: 'Recipe_ToB_C',
    building: 'Build_OilRefinery_C',
    cycleSeconds: 60,
    inputs: [{ item: 'Desc_A_C', amount: 2 }],
    outputs: [{ item: 'Desc_B_C', amount: 1 }],
  },
);

const items: ItemSpec[] = [
  { id: 'Desc_OreIron_C', energyMJ: 0, kind: 'resource' },
  { id: 'Desc_Coal_C', energyMJ: 300, kind: 'resource' },
  { id: 'Desc_NuclearFuelRod_C', energyMJ: 750000, kind: 'nuclear' },
  { id: 'Desc_IronIngot_C', energyMJ: 0, kind: 'part' },
  { id: 'Desc_IronPlate_C', energyMJ: 0, kind: 'part' },
];

const plateRow: Row = {
  kind: 'recipe',
  id: 'r1',
  recipe: 'Recipe_IronPlate_C',
  groups: [
    { count: 8, clock: 1, somersloops: 0 },
    { count: 2, clock: 1, somersloops: 1 },
  ],
};

const context = (
  workshops: Record<string, Row[]> = {},
  calculations: Record<string, Row[]> = {},
): CalcContext => ({
  recipe: (id) => recipes.find((r) => r.id === id),
  building: (id) => buildings.find((b) => b.id === id),
  item: (id) => items.find((i) => i.id === id),
  workshopRows: (id) => workshops[id],
  calculationRows: (id) => calculations[id],
});

const constructor = buildings[0]!;

describe('power', () => {
  it('amplifies output by filled share of slots', () => {
    expect(amplification(0, 1)).toBe(1);
    expect(amplification(1, 1)).toBe(2);
    expect(amplification(1, 2)).toBe(1.5);
    expect(amplification(4, 4)).toBe(2);
    expect(amplification(3, 0)).toBe(1);
  });

  it('scales power by Somersloops squared and clock^1.32', () => {
    expect(buildingPowerMW(4, constructor, 1, 0)).toBe(4);
    expect(buildingPowerMW(4, constructor, 1, 1)).toBe(16);
    expect(buildingPowerMW(4, constructor, 2.5, 1) / 4).toBeCloseTo(13.431, 3);
    expect(buildingPowerMW(4, constructor, 0.5, 0)).toBeCloseTo(1.6, 3);
  });

  it('underclocks the fractional building of a group', () => {
    expect(
      groupPowerMW(4, constructor, { count: 2.5, clock: 1, somersloops: 0 }),
    ).toBeCloseTo(9.6, 3);
  });
});

describe('row flows', () => {
  it('computes a recipe row with Somersloop groups', () => {
    const flows = rowFlows(plateRow, context());
    expect(Object.fromEntries(flows.items)).toEqual({
      Desc_IronIngot_C: -300,
      Desc_IronPlate_C: 240,
    });
    expect(flows.powerMW).toBeCloseTo(-64, 6);
    expect(flows.buildings).toBe(10);
    expect(flows.somersloops).toBe(2);
  });

  it('uses the average power of variable-power recipes', () => {
    const flows = rowFlows(
      {
        kind: 'recipe',
        id: 'r',
        recipe: 'Recipe_PlutoniumCell_C',
        groups: [{ count: 1, clock: 1, somersloops: 0 }],
      },
      context(),
    );
    expect(flows.powerMW).toBe(-500);
    expect(flows.items.get('Desc_PlutoniumCell_C')).toBe(10);
  });

  it('extracts by node purity', () => {
    const flows = rowFlows(
      {
        kind: 'extractor',
        id: 'e',
        building: 'Build_MinerMk2_C',
        resource: 'Desc_OreIron_C',
        purity: 'pure',
        groups: [{ count: 1, clock: 1, somersloops: 0 }],
      },
      context(),
    );
    expect(flows.items.get('Desc_OreIron_C')).toBe(240);
    expect(flows.powerMW).toBe(-15);
  });

  it('burns fuel and water in generators', () => {
    const flows = rowFlows(
      {
        kind: 'generator',
        id: 'g',
        building: 'Build_GeneratorCoal_C',
        fuel: 'Desc_Coal_C',
        groups: [{ count: 2, clock: 1, somersloops: 0 }],
      },
      context(),
    );
    expect(flows.powerMW).toBe(150);
    expect(flows.generationMW).toBe(150);
    expect(flows.items.get('Desc_Coal_C')).toBeCloseTo(-30, 6);
    expect(flows.items.get('Desc_Water_C')).toBeCloseTo(-90, 6);
  });

  it('counts generator byproducts', () => {
    const flows = rowFlows(
      {
        kind: 'generator',
        id: 'n',
        building: 'Build_GeneratorNuclear_C',
        fuel: 'Desc_NuclearFuelRod_C',
        groups: [{ count: 1, clock: 1, somersloops: 0 }],
      },
      context(),
    );
    expect(flows.items.get('Desc_NuclearFuelRod_C')).toBeCloseTo(-0.2, 6);
    expect(flows.items.get('Desc_NuclearWaste_C')).toBeCloseTo(10, 6);
    expect(flows.items.get('Desc_Water_C')).toBeCloseTo(-240, 6);
  });
});

describe('workshops and plants', () => {
  const ingotRow: Row = {
    kind: 'recipe',
    id: 'r2',
    recipe: 'Recipe_IronIngot_C',
    groups: [{ count: 10, clock: 1, somersloops: 0 }],
  };

  it('multiplies a workshop by its copies', () => {
    const flows = rowsFlows(
      [{ kind: 'workshop', id: 'w', workshop: 'plates', copies: 2 }],
      context({ plates: [ingotRow, plateRow] }),
    );
    expect(Object.fromEntries(flows.items)).toEqual({
      Desc_OreIron_C: -600,
      Desc_IronIngot_C: 0,
      Desc_IronPlate_C: 480,
    });
    expect(flows.buildings).toBe(40);
  });

  it('sizes an auto workshop in whole copies, the last one partly loaded', () => {
    const workshop: Row = {
      kind: 'workshop',
      id: 'w',
      workshop: 'plates',
      copies: 1,
      sizing: 'auto',
    };
    const auto = (row: Row) => 'sizing' in row && row.sizing === 'auto';
    // One copy makes 240 plates: 300 is one copy and a quarter of the next.
    for (const [perMinute, copies] of [
      [300, 1.25],
      [480, 2],
      [478, 2],
    ] as const) {
      for (const solver of [solveRows, solveSequential]) {
        const [row] = solver(
          [workshop],
          context({ plates: [ingotRow, plateRow] }),
          [{ item: 'Desc_IronPlate_C', perMinute }],
          auto,
        ).rows;
        expect(row).toMatchObject({ kind: 'workshop', copies });
      }
    }
  });

  it('includes another calculation as a plant', () => {
    const flows = rowsFlows(
      [{ kind: 'plant', id: 'p', calculation: 'base', copies: 3 }],
      context({}, { base: [ingotRow] }),
    );
    expect(flows.items.get('Desc_IronIngot_C')).toBe(900);
  });

  it('rejects cyclic plants', () => {
    const loop: Row = { kind: 'plant', id: 'p', calculation: 'a', copies: 1 };
    expect(() => rowsFlows([loop], context({}, { a: [loop] }))).toThrow(
      /Cyclic reference/,
    );
  });
});

describe('analysis', () => {
  it('classifies the balance', () => {
    const flows = rowsFlows([plateRow], context());
    flows.items.set('Desc_OreIron_C', -10);
    flows.items.set('Desc_Unused_C', 1e-12);
    const entries = balance(flows, ['Desc_IronPlate_C'], context().item);
    expect(entries).toEqual([
      { item: 'Desc_IronPlate_C', perMinute: 240, status: 'target' },
      { item: 'Desc_OreIron_C', perMinute: -10, status: 'raw' },
      { item: 'Desc_IronIngot_C', perMinute: -300, status: 'deficit' },
    ]);
  });

  it('finds building groups for a target rate', () => {
    expect(
      groupsForTarget(
        recipes[1]!,
        constructor,
        'Desc_IronPlate_C',
        240,
        1,
        2,
        1,
      ),
    ).toEqual([
      { count: 8, clock: 1, somersloops: 0 },
      { count: 2, clock: 1, somersloops: 1 },
    ]);
    expect(
      groupsForTarget(
        recipes[1]!,
        constructor,
        'Desc_IronPlate_C',
        30,
        1,
        0,
        0,
      ),
    ).toEqual([{ count: 1.5, clock: 1, somersloops: 0 }]);
    expect(
      groupsForTarget(
        recipes[1]!,
        constructor,
        'Desc_IronPlate_C',
        20,
        1,
        3,
        1,
      ),
    ).toEqual([{ count: 0.5, clock: 1, somersloops: 1 }]);
  });

  it('counts belts for a flow', () => {
    expect(carriers(-360, 270)).toBeCloseTo(1.333, 3);
  });

  it('detects changed and removed recipes', () => {
    const saved = {
      Recipe_IronPlate_C: recipeSignature(recipes[1]!),
      Recipe_IronIngot_C: recipeSignature({ ...recipes[0]!, cycleSeconds: 3 }),
      Recipe_Gone_C: 'x',
    };
    expect(recipeChanges(saved, context().recipe)).toEqual([
      { recipe: 'Recipe_IronIngot_C', status: 'changed' },
      { recipe: 'Recipe_Gone_C', status: 'removed' },
    ]);
  });
});

/** Buildings at 100 % a row's groups are worth: whole buildings may run slower. */
const work = (groups: { count: number; clock: number }[]) =>
  Math.round(groups.reduce((sum, g) => sum + g.count * g.clock, 0) * 1e4) / 1e4;

describe('solver', () => {
  const auto = (id: string, recipe: string): Row => ({
    kind: 'recipe',
    id,
    recipe,
    groups: [{ count: 1, clock: 1, somersloops: 0 }],
    sizing: 'auto',
  });
  const fixedPlates = (id: string, count: number): Row => ({
    kind: 'recipe',
    id,
    recipe: 'Recipe_IronPlate_C',
    groups: [{ count, clock: 1, somersloops: 0 }],
    sizing: 'fixed',
  });
  const extractor = (id: string, building: string, resource: string): Row => ({
    kind: 'extractor',
    id,
    building,
    resource,
    purity: 'normal',
    groups: [{ count: 1, clock: 1, somersloops: 0 }],
    sizing: 'auto',
  });
  const isAuto = (row: Row) => 'sizing' in row && row.sizing === 'auto';
  const counts = (
    rows: Row[],
    goals: { item: string; perMinute: number }[] = [],
  ) => {
    const solution = solveRows(rows, context(), goals, isAuto);
    return {
      status: solution.status,
      counts: solution.rows.map((r) => ('groups' in r ? work(r.groups) : 0)),
    };
  };

  it('solves a linear program', () => {
    const result = minimize(
      [1, 1],
      [
        [1, 0],
        [0, 2],
        [1, 1],
      ],
      [2, 2, 4],
    );
    expect(result.status).toBe('optimal');
    if (result.status === 'optimal') {
      expect(result.x[0]! + result.x[1]!).toBeCloseTo(4, 9);
      expect(result.x[1]).toBeGreaterThanOrEqual(1 - 1e-9);
    }
  });

  it('does not depend on row order', () => {
    const ingots = auto('ingots', 'Recipe_IronIngot_C');
    expect(
      counts([fixedPlates('a', 2), ingots, fixedPlates('b', 1)]).counts,
    ).toEqual([2, 3, 1]);
    expect(
      counts([ingots, fixedPlates('a', 2), fixedPlates('b', 1)]).counts,
    ).toEqual([3, 2, 1]);
  });

  it('pulls the whole chain from a goal', () => {
    const rows = [
      extractor('ore', 'Build_MinerMk2_C', 'Desc_OreIron_C'),
      auto('ingots', 'Recipe_IronIngot_C'),
      auto('plates', 'Recipe_IronPlate_C'),
    ];
    const result = counts(rows, [{ item: 'Desc_IronPlate_C', perMinute: 60 }]);
    expect(result.status).toBe('ok');
    expect(result.counts).toEqual([0.75, 3, 3]);
  });

  it('adds a goal on top of what other rows consume', () => {
    const rows = [fixedPlates('a', 2), auto('ingots', 'Recipe_IronIngot_C')];
    expect(
      counts(rows, [{ item: 'Desc_IronIngot_C', perMinute: 15 }]).counts,
    ).toEqual([2, 2.5]);
  });

  it('balances a loop that returns water', () => {
    const rows = [
      auto('scrap', 'Recipe_Scrap_C'),
      auto('solution', 'Recipe_Solution_C'),
      extractor('water', 'Build_WaterPump_C', 'Desc_Water_C'),
    ];
    const solution = solveRows(
      rows,
      context(),
      [{ item: 'Desc_Scrap_C', perMinute: 60 }],
      isAuto,
    );
    const flows = rowsFlows(solution.rows, context());
    expect(flows.items.get('Desc_Scrap_C')).toBeCloseTo(60, 6);
    expect(flows.items.get('Desc_Solution_C')).toBeCloseTo(0, 6);
    // 90 m³ go into the solution, 60 m³ come back from scrap: pumps cover 30.
    expect(flows.items.get('Desc_Water_C')).toBeCloseTo(0, 6);
    expect(
      counts(rows, [{ item: 'Desc_Scrap_C', perMinute: 60 }]).counts,
    ).toEqual([60, 30, 0.25]);
  });

  it('keeps an auto row empty when nothing needs it', () => {
    expect(counts([auto('ingots', 'Recipe_IronIngot_C')]).counts).toEqual([0]);
  });

  it('reports goals that cannot be met', () => {
    // A is made from B and B from two A: the loop loses A, no amount satisfies the goal.
    const result = counts(
      [auto('toA', 'Recipe_ToA_C'), auto('toB', 'Recipe_ToB_C')],
      [{ item: 'Desc_A_C', perMinute: 10 }],
    );
    expect(result.status).toBe('infeasible');
  });

  it('resizes a row to a requested output', () => {
    expect(
      rowForOutput(plateRow, context(), 'Desc_IronPlate_C', 300),
    ).toMatchObject({
      groups: [
        { count: 11, clock: 1, somersloops: 0 },
        { count: 2, clock: 1, somersloops: 1 },
      ],
    });
  });

  const both = (rows: Row[], goals: { item: string; perMinute: number }[]) =>
    [solveRows, solveSequential].map((solver) =>
      solver(rows, context(), goals, isAuto).rows.map((r) =>
        'groups' in r ? work(r.groups) : 0,
      ),
    );

  it('keeps a fixed row as set and lets an auto row of the same item cover the rest', () => {
    const plates60 = [{ item: 'Desc_IronPlate_C', perMinute: 60 }];
    const rows = [fixedPlates('a', 1), auto('b', 'Recipe_IronPlate_C')];
    expect(both(rows, plates60)).toEqual([
      [1, 2],
      [1, 2],
    ]);
  });

  it('locks a row at an exact output of one of its products', () => {
    const plates: Row = {
      ...fixedPlates('a', 1),
      sizing: 'auto',
      output: { item: 'Desc_IronPlate_C', perMinute: 20 },
    } as Row;
    // The goal wants 60, but the locked row makes exactly 20.
    expect(
      both([plates], [{ item: 'Desc_IronPlate_C', perMinute: 60 }]),
    ).toEqual([[1], [1]]);
    // Locked at its byproduct: one scrap refinery returns 1 m³ of water a minute.
    const scrap: Row = {
      ...auto('scrap', 'Recipe_Scrap_C'),
      output: { item: 'Desc_Water_C', perMinute: 30 },
    } as Row;
    const solved = solveRows([scrap], context(), [], isAuto).rows[0]!;
    expect(
      rowsFlows([solved], context()).items.get('Desc_Scrap_C'),
    ).toBeCloseTo(30, 6);
  });

  it('leaves a shortfall of a fixed row as a deficit', () => {
    const ingots: Row = {
      kind: 'recipe',
      id: 'ingots',
      recipe: 'Recipe_IronIngot_C',
      groups: [{ count: 1, clock: 1, somersloops: 0 }],
      sizing: 'fixed',
    };
    const rows = [auto('plates', 'Recipe_IronPlate_C'), ingots];
    const goals = [{ item: 'Desc_IronPlate_C', perMinute: 60 }];
    for (const counts of both(rows, goals)) expect(counts).toEqual([3, 1]);
    const solution = solveRows(rows, context(), goals, isAuto);
    expect(solution.status).toBe('ok');
    // 3 constructors eat 90 ingots, the fixed smelter gives 30.
    expect(
      rowsFlows(solution.rows, context()).items.get('Desc_IronIngot_C'),
    ).toBeCloseTo(-60, 6);
  });

  it('never makes a negative building count', () => {
    // The fixed row alone makes more than the goal and the consumers need.
    const rows = [
      fixedPlates('a', 4),
      auto('b', 'Recipe_IronPlate_C'),
      auto('ingots', 'Recipe_IronIngot_C'),
    ];
    for (const counts of both(rows, [
      { item: 'Desc_IronPlate_C', perMinute: 20 },
    ])) {
      expect(counts[1]).toBe(0);
      expect(counts.every((n) => n >= 0)).toBe(true);
    }
  });

  it('builds whole buildings evenly underclocked at the default clock', () => {
    const rows = [auto('plates', 'Recipe_IronPlate_C')];
    // 50 plates need 2.5 constructors: three at 83.33 %.
    for (const solver of [solveRows, solveSequential]) {
      const [row] = solver(
        rows,
        context(),
        [{ item: 'Desc_IronPlate_C', perMinute: 50 }],
        isAuto,
      ).rows;
      expect('groups' in row! && row.groups).toEqual([
        { count: 3, clock: 0.833333, somersloops: 0 },
      ]);
    }
  });

  it('takes a clock less than 1 % under 100 % or a hair above as 100 %', () => {
    const rows = [auto('plates', 'Recipe_IronPlate_C')];
    // 59.7 plates need 2.985 constructors: three at 99.5 % run at 100 %;
    // 60.001 is rounding left by rows before, not a fourth constructor.
    for (const perMinute of [59.7, 60.001]) {
      for (const solver of [solveRows, solveSequential]) {
        const [row] = solver(
          rows,
          context(),
          [{ item: 'Desc_IronPlate_C', perMinute }],
          isAuto,
        ).rows;
        expect('groups' in row! && row.groups).toEqual([
          { count: 3, clock: 1, somersloops: 0 },
        ]);
      }
    }
  });

  it('cuts Somersloop buildings to whole underclocked ones', () => {
    const boosted: Row = {
      ...auto('plates', 'Recipe_IronPlate_C'),
      groups: [{ count: 2, clock: 1, somersloops: 1 }],
    } as Row;
    // One Somersloop doubles a constructor: 20 plates need 0.5 boosted buildings.
    const [row] = solveSequential(
      [boosted],
      context(),
      [{ item: 'Desc_IronPlate_C', perMinute: 20 }],
      isAuto,
    ).rows;
    expect('groups' in row! && row.groups).toEqual([
      { count: 1, clock: 0.5, somersloops: 1 },
    ]);
  });

  it('keeps a clock set on purpose and runs the last building slower', () => {
    const row: Row = {
      ...auto('plates', 'Recipe_IronPlate_C'),
      groups: [{ count: 1, clock: 2, somersloops: 0 }],
    } as Row;
    const [solved] = solveRows(
      [row],
      context(),
      [{ item: 'Desc_IronPlate_C', perMinute: 50 }],
      isAuto,
    ).rows;
    expect('groups' in solved! && solved.groups).toEqual([
      { count: 1.25, clock: 2, somersloops: 0 },
    ]);
  });

  it('adapts the clock to a building count chosen by the user', () => {
    const pinned = (buildings: number): Row =>
      ({ ...auto('plates', 'Recipe_IronPlate_C'), buildings }) as Row;
    const goal = [{ item: 'Desc_IronPlate_C', perMinute: 50 }];
    for (const solver of [solveRows, solveSequential]) {
      const [row] = solver([pinned(5)], context(), goal, isAuto).rows;
      expect('groups' in row! && row.groups).toEqual([
        { count: 5, clock: 0.5, somersloops: 0 },
      ]);
    }
    // One building tops out at 250 %, 50 plates/min: 60 cannot be met.
    const more = [{ item: 'Desc_IronPlate_C', perMinute: 60 }];
    expect(solveRows([pinned(1)], context(), more, isAuto).status).toBe(
      'infeasible',
    );
    const [capped] = solveSequential([pinned(1)], context(), more, isAuto).rows;
    expect('groups' in capped! && capped.groups).toEqual([
      { count: 1, clock: 2.5, somersloops: 0 },
    ]);
  });

  it('sizes top to bottom in sequential mode', () => {
    const ingots = auto('ingots', 'Recipe_IronIngot_C');
    const sequential = (rows: Row[]) =>
      solveSequential(rows, context(), [], isAuto).rows.map((r) =>
        'groups' in r ? work(r.groups) : 0,
      );
    expect(
      sequential([fixedPlates('a', 2), ingots, fixedPlates('b', 1)]),
    ).toEqual([2, 2, 1]);
    expect(
      sequential([fixedPlates('a', 2), fixedPlates('b', 1), ingots]),
    ).toEqual([2, 1, 3]);
    const goal = solveSequential(
      [auto('plates', 'Recipe_IronPlate_C'), ingots],
      context(),
      [{ item: 'Desc_IronPlate_C', perMinute: 60 }],
      isAuto,
    );
    expect(
      goal.rows.map((r) => ('groups' in r ? r.groups[0]?.count : 0)),
    ).toEqual([3, 3]);
  });
});
