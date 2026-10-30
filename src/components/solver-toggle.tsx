import type { SolverMode } from '../engine';
import uiCss from './ui.module.css';
import { t } from '../i18n';

const MODES: SolverMode[] = ['sequential', 'matrix'];

/** How auto rows are sized, like the solver choice of a Helmod block. */
export const SolverToggle = ({
  value,
  onChange,
}: {
  value: SolverMode;
  onChange: (value: SolverMode) => void;
}) => (
  <span className="hstack" style={{ gap: 6 }}>
    <span className="t-label muted">{t.solver.label}</span>
    <span
      className={uiCss.segmented}
      role="radiogroup"
      aria-label={t.solver.label}
    >
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          title={t.solver[mode].title}
          className={mode === value ? uiCss.active : undefined}
          onClick={() => onChange(mode)}
        >
          {t.solver[mode].label}
        </button>
      ))}
    </span>
  </span>
);
