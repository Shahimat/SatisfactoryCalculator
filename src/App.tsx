import { lazy, Suspense, useEffect } from 'react';

import logo from './assets/logo.webp';
import type { Units } from './model';
import { LOCALES, setLocale, t, useLocale } from './i18n';
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

const SECTIONS = ['calc', 'workshops', 'plants', 'reference'] as const;

const UNITS: Units[] = ['ipm', 1, 2, 3, 4, 5, 6];

const App = () => {
  const [section, param] = useRoute();
  const state = useAppState();
  const locale = useLocale();
  useEffect(() => {
    if (!section) navigate('/calc');
  }, [section]);
  return (
    <div className={appCss.app}>
      <header className={appCss.topbar}>
        <a href="#/calc" className={appCss.logo} title={t.app.home}>
          <img src={logo} alt="Satisfactory" height={40} />
        </a>
        <nav className={appCss.nav}>
          {SECTIONS.map((path) => (
            <a
              key={path}
              href={`#/${path}`}
              className={section === path ? appCss.active : undefined}
            >
              {t.nav[path]}
            </a>
          ))}
        </nav>
        <span className="spacer" />
        <div className={appCss.units}>
          <span className="t-label muted">{t.app.units}</span>
          <div
            className={uiCss.segmented}
            role="radiogroup"
            aria-label={t.app.unitsAria}
          >
            {UNITS.map((u) => (
              <button
                key={u}
                type="button"
                className={state.units === u ? uiCss.active : undefined}
                onClick={() => setState((s) => ({ ...s, units: u }))}
              >
                {u === 'ipm' ? t.units.ipm : `Mk.${u}`}
              </button>
            ))}
          </div>
        </div>
        <div className={appCss.units}>
          <span className="t-label muted">{t.app.language}</span>
          <div
            className={uiCss.segmented}
            role="radiogroup"
            aria-label={t.app.language}
          >
            {LOCALES.map((l) => (
              <button
                key={l.value}
                type="button"
                className={locale === l.value ? uiCss.active : undefined}
                onClick={() => void setLocale(l.value)}
              >
                {l.label}
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
