import { lazy, Suspense, useEffect } from 'react';

import logo from './assets/logo.webp';
import type { Units } from './model';
import { navigate, useRoute } from './router';
import { CalculationsScreen } from './screens/calculations';
import { PlantsScreen } from './screens/plants';
import { WorkshopsScreen } from './screens/workshops';
import { setState, useAppState } from './store';
import appCss from './App.module.css';
import uiCss from './components/ui.module.css';
// Last: component modules come first in the bundle, utilities override them.
import './utilities.css';

/** The reference is visited rarely, so its code loads on first visit. */
const ReferenceScreen = lazy(() =>
  import('./screens/reference').then((m) => ({ default: m.ReferenceScreen })),
);

const SECTIONS = [
  { path: 'calc', label: 'Расчёты' },
  { path: 'workshops', label: 'Цеха' },
  { path: 'plants', label: 'Заводы' },
  { path: 'reference', label: 'Справочник' },
] as const;

const UNITS: { value: Units; label: string }[] = [
  { value: 'ipm', label: 'шт/мин' },
  ...([1, 2, 3, 4, 5, 6] as const).map((mk) => ({
    value: mk,
    label: `Mk.${mk}`,
  })),
];

const App = () => {
  const [section, param] = useRoute();
  const state = useAppState();
  useEffect(() => {
    if (!section) navigate('/calc');
  }, [section]);
  return (
    <div className={appCss.app}>
      <header className={appCss.topbar}>
        <a
          href="#/calc"
          className={appCss.logo}
          title="Калькулятор Satisfactory"
        >
          <img src={logo} alt="Satisfactory" height={40} />
        </a>
        <nav className={appCss.nav}>
          {SECTIONS.map((s) => (
            <a
              key={s.path}
              href={`#/${s.path}`}
              className={section === s.path ? appCss.active : undefined}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <span className="spacer" />
        <div className={appCss.units}>
          <span className="t-label muted">Единицы</span>
          <div
            className={uiCss.segmented}
            role="radiogroup"
            aria-label="Единицы потока"
          >
            {UNITS.map((u) => (
              <button
                key={u.value}
                type="button"
                className={state.units === u.value ? uiCss.active : undefined}
                onClick={() => setState((s) => ({ ...s, units: u.value }))}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      {section === 'workshops' ? (
        <WorkshopsScreen id={param} />
      ) : section === 'plants' ? (
        <PlantsScreen />
      ) : section === 'reference' ? (
        <Suspense fallback={null}>
          <ReferenceScreen tab={param} />
        </Suspense>
      ) : (
        <CalculationsScreen id={param} />
      )}
    </div>
  );
};

export default App;
