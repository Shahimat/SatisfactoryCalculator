/** Pivot values below this are treated as zero. */
const EPS = 1e-9;

export type LpResult =
  | { status: 'optimal'; x: number[] }
  | { status: 'infeasible' };

/**
 * Minimizes `cost · x` subject to `A x ≥ b` and `x ≥ 0` with a two-phase
 * dense simplex. Bland's rule keeps it from cycling on degenerate bases,
 * which production chains with loops produce often.
 */
export const minimize = (
  cost: number[],
  a: number[][],
  b: number[],
): LpResult => {
  const n = cost.length;
  const m = a.length;
  // Columns: x (n), slack/surplus (m), artificial (m), right-hand side.
  const width = n + 2 * m + 1;
  const rhs = width - 1;
  const tableau: number[][] = [];
  const basis: number[] = [];
  for (let i = 0; i < m; i++) {
    const row = new Array<number>(width).fill(0);
    const sign = (b[i] ?? 0) >= 0 ? 1 : -1;
    for (let j = 0; j < n; j++) row[j] = sign * (a[i]?.[j] ?? 0);
    // A x - s = b; for b < 0 the row is flipped into -A x + s = -b with s basic.
    row[n + i] = -sign;
    row[rhs] = sign * (b[i] ?? 0);
    if (sign > 0) {
      row[n + m + i] = 1;
      basis.push(n + m + i);
    } else {
      basis.push(n + i);
    }
    tableau.push(row);
  }

  const run = (
    objective: number[],
    allowed: (column: number) => boolean,
  ): boolean => {
    for (;;) {
      // Reduced costs of the current basis.
      const reduced = objective.slice(0, rhs);
      for (let i = 0; i < m; i++) {
        const c = objective[basis[i]!] ?? 0;
        if (c === 0) continue;
        for (let j = 0; j < rhs; j++) reduced[j]! -= c * tableau[i]![j]!;
      }
      let enter = -1;
      for (let j = 0; j < rhs; j++) {
        if (allowed(j) && reduced[j]! < -EPS) {
          enter = j;
          break;
        }
      }
      if (enter < 0) return true;
      let leave = -1;
      let best = Infinity;
      for (let i = 0; i < m; i++) {
        const coefficient = tableau[i]![enter]!;
        if (coefficient <= EPS) continue;
        const ratio = tableau[i]![rhs]! / coefficient;
        if (
          ratio < best - EPS ||
          (Math.abs(ratio - best) <= EPS && basis[i]! < basis[leave]!)
        ) {
          best = ratio;
          leave = i;
        }
      }
      if (leave < 0) return false;
      pivot(leave, enter);
    }
  };

  const pivot = (row: number, column: number) => {
    const target = tableau[row]!;
    const factor = target[column]!;
    for (let j = 0; j < width; j++) target[j]! /= factor;
    for (let i = 0; i < m; i++) {
      if (i === row) continue;
      const current = tableau[i]!;
      const scale = current[column]!;
      if (Math.abs(scale) <= EPS) continue;
      for (let j = 0; j < width; j++) current[j]! -= scale * target[j]!;
    }
    basis[row] = column;
  };

  const phaseOne = new Array<number>(width).fill(0);
  for (let i = 0; i < m; i++) phaseOne[n + m + i] = 1;
  run(phaseOne, () => true);
  const infeasibility = basis.reduce(
    (sum, column, i) => sum + (column >= n + m ? tableau[i]![rhs]! : 0),
    0,
  );
  if (infeasibility > 1e-6) return { status: 'infeasible' };

  const phaseTwo = new Array<number>(width).fill(0);
  for (let j = 0; j < n; j++) phaseTwo[j] = cost[j] ?? 0;
  const bounded = run(phaseTwo, (column) => column < n + m);
  if (!bounded) return { status: 'infeasible' };

  const x = new Array<number>(n).fill(0);
  for (let i = 0; i < m; i++) {
    const column = basis[i]!;
    if (column < n) x[column] = tableau[i]![rhs]!;
  }
  return { status: 'optimal', x };
};
