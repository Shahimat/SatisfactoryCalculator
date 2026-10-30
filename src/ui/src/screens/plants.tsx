import { emptyFlows, mergeFlows } from '../../../engine/src/calc';
import { countLabel, evaluate, plain, splitFlows } from '../calc';
import { FlowChip, PowerChip } from '../components/chips';
import { Icon } from '../components/icons';
import { Button, NumberInput } from '../components/ui';
import { setState, useAppState } from '../store';
import { cx } from '../cx';
import layoutCss from './layout.module.css';
import uiCss from '../components/ui.module.css';

const setBuilt = (id: string, built: number) =>
  setState((s) => ({
    ...s,
    calculations: s.calculations.map((c) =>
      c.id === id ? { ...c, built } : c,
    ),
  }));

export const PlantsScreen = () => {
  const state = useAppState();
  const evaluations = state.calculations.map((calc) => ({
    calc,
    evaluation: evaluate(calc, state),
  }));
  // A plant row only references another calculation; a built one is counted on its own.
  const grid = emptyFlows();
  for (const calc of state.calculations) {
    if (calc.built === 0) continue;
    const ownRows = calc.rows.filter((row) => row.kind !== 'plant');
    mergeFlows(
      grid,
      evaluate({ ...calc, rows: ownRows }, state).total,
      calc.built,
    );
  }
  const generation = grid.generationMW;
  const consumption = generation - grid.powerMW;
  const load = generation > 0 ? (consumption / generation) * 100 : 0;
  const output = splitFlows(grid.items).outputs;
  return (
    <main className={layoutCss.content}>
      <div className={layoutCss.pageHeader}>
        <div className={layoutCss.heading}>
          <h1 className="t-display">Заводы</h1>
          <span className="secondary">
            Построенные расчёты образуют энергосеть. Черновики в неё не входят.
          </span>
        </div>
      </div>
      <div className="hstack" style={{ alignItems: 'stretch' }}>
        <Stat
          label="Генерация"
          value={`+${plain(generation, 1)}`}
          unit="МВт"
          color="var(--flow-out)"
        />
        <Stat
          label="Потребление"
          value={`−${plain(consumption, 1)}`}
          unit="МВт"
          color="var(--flow-in)"
        />
        <Stat
          label="Запас"
          value={`${grid.powerMW >= 0 ? '+' : '−'}${plain(Math.abs(grid.powerMW), 1)}`}
          unit="МВт"
          color={
            grid.powerMW >= 0 ? 'var(--flow-out)' : 'var(--status-deficit)'
          }
        />
        <Stat
          label="Загрузка"
          value={generation > 0 ? plain(load, 0) : '—'}
          unit="%"
          color={load > 100 ? 'var(--status-deficit)' : 'var(--text-primary)'}
        />
      </div>
      {output.length > 0 && (
        <div className="stack">
          <span className="t-label muted">Выпуск всех заводов</span>
          <div className={uiCss.flows}>
            {output.map(([item, v]) => (
              <FlowChip
                key={item}
                item={item}
                perMinute={v}
                units={state.units}
              />
            ))}
          </div>
        </div>
      )}
      <div className={layoutCss.cards}>
        {evaluations.map(({ calc, evaluation }) => {
          const { outputs } = splitFlows(evaluation.total.items);
          return (
            <div className={layoutCss.card} key={calc.id}>
              <span className="hstack">
                <Icon name="factory" color="var(--accent-primary)" />
                <a
                  className="t-title"
                  href={`#/calc/${calc.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  {calc.name}
                </a>
                <span className="spacer" />
                <span className={cx(uiCss.badge, calc.built > 0 && uiCss.ok)}>
                  {calc.built > 0 ? `Построено ×${calc.built}` : 'Черновик'}
                </span>
              </span>
              <span className="t-body-sm muted">
                {countLabel(
                  evaluation.total.buildings,
                  'здание',
                  'здания',
                  'зданий',
                )}{' '}
                на копию
              </span>
              <div className={uiCss.flows}>
                {outputs.map(([item, v]) => (
                  <FlowChip
                    key={item}
                    item={item}
                    perMinute={v}
                    units={state.units}
                  />
                ))}
                {evaluation.total.powerMW !== 0 && (
                  <PowerChip powerMW={evaluation.total.powerMW} />
                )}
              </div>
              <div className="hstack">
                {calc.built > 0 ? (
                  <>
                    <span className="t-body-sm muted">Построено копий</span>
                    <div style={{ width: 110 }}>
                      <NumberInput
                        value={calc.built}
                        min={1}
                        step={1}
                        onChange={(v) =>
                          setBuilt(calc.id, Math.max(1, Math.round(v || 1)))
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => setBuilt(calc.id, 0)}
                    >
                      В черновик
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setBuilt(calc.id, 1)}
                  >
                    Построен
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {state.calculations.length === 0 && (
        <div className={cx(layoutCss.empty, 'secondary')}>
          Заводов пока нет — сначала соберите расчёт.
        </div>
      )}
    </main>
  );
};

const Stat = ({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: string;
  unit: string;
  color: string;
}) => (
  <div className={layoutCss.stat}>
    <span className="t-label muted">{label}</span>
    <span className={layoutCss.value} style={{ color }}>
      {value} <span className="t-num-sm muted">{unit}</span>
    </span>
  </div>
);
