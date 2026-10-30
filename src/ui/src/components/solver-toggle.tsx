import type { SolverMode } from '../../../engine/src/calc';
import uiCss from './ui.module.css';

const MODES: { value: SolverMode; label: string; title: string }[] = [
  {
    value: 'sequential',
    label: 'Сверху вниз',
    title: 'Строка покрывает цели и строки выше — порядок строк важен',
  },
  {
    value: 'matrix',
    label: 'Матрица',
    title: 'Все строки решаются вместе — порядок не важен, петли сходятся',
  },
];

/** How auto rows are sized, like the solver choice of a Helmod block. */
export const SolverToggle = ({
  value,
  onChange,
}: {
  value: SolverMode;
  onChange: (value: SolverMode) => void;
}) => (
  <span className="hstack" style={{ gap: 6 }}>
    <span className="t-label muted">Расчёт строк</span>
    <span
      className={uiCss.segmented}
      role="radiogroup"
      aria-label="Расчёт строк"
    >
      {MODES.map((mode) => (
        <button
          key={mode.value}
          type="button"
          title={mode.title}
          className={mode.value === value ? uiCss.active : undefined}
          onClick={() => onChange(mode.value)}
        >
          {mode.label}
        </button>
      ))}
    </span>
  </span>
);
