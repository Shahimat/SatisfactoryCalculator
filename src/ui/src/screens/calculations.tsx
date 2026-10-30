import { useCallback, useState } from 'react';

import {
  emptyFlows,
  FLOW_EPSILON,
  type Goal,
  mergeFlows,
  type RecipeChange,
  type Row,
} from '../../../engine/src/calc';
import {
  catalog,
  DEFAULT_ITEM,
  isFluid,
  producibleItems,
  SOMERSLOOP_ICON,
} from '../catalog';
import {
  acknowledgeVersion,
  countLabel,
  buildList,
  evaluate,
  placedCopies,
  signaturesFor,
  signed,
  versionChanges,
} from '../calc';
import { AddRowModal } from '../components/add-row';
import {
  ConnectModal,
  ExportModal,
  ImportModal,
} from '../components/exchange-modals';
import { Icon } from '../components/icons';
import { RowsView } from '../components/rows';
import { SolverToggle } from '../components/solver-toggle';
import { Button, Field, GameIcon, NumberInput, Select } from '../components/ui';
import { type Calculation, newId, type Workshop } from '../model';
import { navigate } from '../router';
import { setState, useAppState } from '../store';
import { cx } from '../cx';
import layoutCss from './layout.module.css';
import uiCss from '../components/ui.module.css';

type Dialog =
  | { kind: 'add'; item?: string; rate?: number; picked?: boolean }
  | { kind: 'workshop' | 'plant' | 'export' | 'import' };

const newCalculation = (name: string): Calculation => ({
  id: newId(),
  name,
  goals: [],
  solver: 'matrix',
  rows: [],
  built: 0,
  gameVersion: catalog.version,
  recipeSignatures: {},
});

const updateCalculation = (
  id: string,
  update: (c: Calculation) => Calculation,
) =>
  setState((s) => ({
    ...s,
    calculations: s.calculations.map((c) => (c.id === id ? update(c) : c)),
  }));

const createCalculation = () => {
  const calc = newCalculation('Новый расчёт');
  setState((s) => ({ ...s, calculations: [...s.calculations, calc] }));
  navigate(`/calc/${calc.id}`);
};

export const CalculationsScreen = ({ id }: { id?: string }) => {
  const state = useAppState();
  const calc =
    state.calculations.find((c) => c.id === id) ?? state.calculations[0];
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const close = () => setDialog(null);
  return (
    <div className={layoutCss.page}>
      <aside className={layoutCss.sidebar}>
        {state.calculations.map((c) => {
          const power = evaluate(c, state).total.powerMW;
          return (
            <a
              key={c.id}
              href={`#/calc/${c.id}`}
              className={cx(
                layoutCss.sideItem,
                c.id === calc?.id && layoutCss.active,
              )}
            >
              <span>{c.name}</span>
              <span className="t-num-sm muted">
                {c.rows.length === 0
                  ? 'пусто'
                  : `${countLabel(c.rows.length, 'строка', 'строки', 'строк')} · ${signed(power, 1)} МВт`}
              </span>
            </a>
          );
        })}
        <div>
          <Button variant="ghost" icon="plus" onClick={createCalculation}>
            Новый расчёт
          </Button>
        </div>
      </aside>
      <main className={layoutCss.content}>
        {calc ? (
          <CalculationView calc={calc} openDialog={setDialog} />
        ) : (
          <div className={layoutCss.empty}>
            <Icon name="factory" size={40} color="var(--accent-primary)" />
            <h2 className="t-heading">Расчётов пока нет</h2>
            <div className="hstack">
              <Button variant="primary" icon="plus" onClick={createCalculation}>
                Новый расчёт
              </Button>
              <Button
                variant="ghost"
                icon="arrowDown"
                onClick={() => setDialog({ kind: 'import' })}
              >
                Импорт из файла
              </Button>
            </div>
          </div>
        )}
      </main>
      {calc && dialog?.kind === 'add' && (
        <AddRowModal
          initialItem={dialog.item}
          initialRate={dialog.rate}
          onClose={close}
          onAdd={(row, goal) => {
            // A picked item is an intermediate: it only covers what the other
            // rows consume. An item chosen from scratch becomes a goal.
            const sizable = row.kind === 'recipe' || row.kind === 'extractor';
            const sized: Row = sizable ? { ...row, sizing: 'auto' } : row;
            addRow(calc, sized, dialog.picked ? undefined : goal);
            close();
          }}
        />
      )}
      {calc && (dialog?.kind === 'workshop' || dialog?.kind === 'plant') && (
        <ConnectModal
          kind={dialog.kind}
          excludeCalculation={calc.id}
          onClose={close}
          onAdd={(row) => {
            addRow(calc, row);
            close();
          }}
        />
      )}
      {dialog?.kind === 'export' && (
        <ExportModal initial={{ calculation: calc?.id }} onClose={close} />
      )}
      {dialog?.kind === 'import' && <ImportModal onClose={close} />}
    </div>
  );
};

const addRow = (calc: Calculation, row: Row, goal?: Goal) =>
  updateCalculation(calc.id, (c) => ({
    ...c,
    rows: [...c.rows, row],
    goals: goal
      ? [...c.goals.filter((g) => g.item !== goal.item), goal]
      : c.goals,
    recipeSignatures: { ...c.recipeSignatures, ...signaturesFor([row]) },
  }));

/** A row taken out of a workshop with `copies` copies, under a new id. */
const scaled = (row: Row, copies: number): Row => {
  const id = newId();
  if (row.kind === 'workshop' || row.kind === 'plant') {
    return { ...row, id, copies: row.copies * copies };
  }
  return {
    ...row,
    id,
    groups: row.groups.map((g) => ({ ...g, count: g.count * copies })),
    ...('output' in row &&
      row.output && {
        output: { ...row.output, perMinute: row.output.perMinute * copies },
      }),
    ...('buildings' in row &&
      row.buildings && { buildings: row.buildings * copies }),
  } as Row;
};

const CalculationView = ({
  calc,
  openDialog,
}: {
  calc: Calculation;
  openDialog: (dialog: Dialog) => void;
}) => {
  const state = useAppState();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const evaluation = evaluate(calc, state);
  const changes = versionChanges(calc);
  const outdated = calc.gameVersion !== catalog.version;
  const setRows = (rows: Row[]) =>
    updateCalculation(calc.id, (c) => ({ ...c, rows }));

  // The new workshop or plant keeps delivering what the rows delivered here.
  const groupSelected = (into: 'workshop' | 'plant') => {
    const rows = calc.rows.filter((r) => selected.has(r.id));
    const delivered = emptyFlows();
    for (const result of evaluation.rows) {
      if (selected.has(result.source.id)) mergeFlows(delivered, result.flows);
    }
    const plan = {
      id: newId(),
      rows,
      goals: [...delivered.items]
        .filter(([, perMinute]) => perMinute > FLOW_EPSILON)
        .map(([item, perMinute]) => ({ item, perMinute })),
      solver: calc.solver,
      gameVersion: calc.gameVersion,
      recipeSignatures: signaturesFor(rows),
    };
    const index = calc.rows.findIndex((r) => selected.has(r.id));
    const remaining = calc.rows.filter((r) => !selected.has(r.id));
    remaining.splice(
      index,
      0,
      into === 'workshop'
        ? { kind: 'workshop', id: newId(), workshop: plan.id, copies: 1 }
        : { kind: 'plant', id: newId(), calculation: plan.id, copies: 1 },
    );
    setState((s) => {
      const calculations = s.calculations.map((c) =>
        c.id === calc.id ? { ...c, rows: remaining } : c,
      );
      return into === 'workshop'
        ? {
            ...s,
            workshops: [
              ...s.workshops,
              { ...plan, name: `Цех из «${calc.name}»` } satisfies Workshop,
            ],
            calculations,
          }
        : {
            ...s,
            calculations: [
              ...calculations,
              {
                ...plan,
                name: `Завод из «${calc.name}»`,
                built: 0,
              } satisfies Calculation,
            ],
          };
    });
    setSelected(new Set());
  };

  const selectedNested = calc.rows.filter(
    (r) => selected.has(r.id) && (r.kind === 'workshop' || r.kind === 'plant'),
  );
  // Each selected workshop or plant goes back to its rows, times the copies
  // placed here; the workshop or plant itself stays in storage.
  const expandSelected = () => {
    const signatures: Record<string, string> = {};
    const rows = evaluation.rows.flatMap(({ source, row }) => {
      if (!selected.has(source.id)) return [source];
      const inner =
        row.kind === 'workshop'
          ? state.workshops.find((w) => w.id === row.workshop)
          : row.kind === 'plant'
            ? state.calculations.find((c) => c.id === row.calculation)
            : undefined;
      if (!inner || !('copies' in row)) return [source];
      Object.assign(signatures, inner.recipeSignatures);
      return inner.rows.map((r) => scaled(r, placedCopies(row.copies)));
    });
    updateCalculation(calc.id, (c) => ({
      ...c,
      rows,
      recipeSignatures: { ...signatures, ...c.recipeSignatures },
    }));
    setSelected(new Set());
  };

  const build = buildList(evaluation, state);
  // «Итого» sticks right under the page header, whatever its height.
  const stickHeader = useCallback((header: HTMLDivElement | null) => {
    if (!header?.parentElement) return;
    const content = header.parentElement;
    const observer = new ResizeObserver(() =>
      content.style.setProperty(
        '--page-header-height',
        `${header.offsetHeight}px`,
      ),
    );
    observer.observe(header);
    return () => observer.disconnect();
  }, []);
  const somersloops = build.cost.get(SOMERSLOOP_ICON) ?? 0;
  const meta = [
    countLabel(calc.rows.length, 'строка', 'строки', 'строк'),
    countLabel(build.placed, 'здание', 'здания', 'зданий'),
    somersloops > 0
      ? countLabel(somersloops, 'петлевик', 'петлевика', 'петлевиков')
      : null,
  ].filter(Boolean);

  return (
    <>
      <div className={layoutCss.pageHeader} ref={stickHeader}>
        <div className={layoutCss.heading}>
          <input
            className="t-display"
            style={{
              background: 'none',
              border: 0,
              outline: 'none',
              minWidth: 0,
            }}
            value={calc.name}
            aria-label="Название расчёта"
            onChange={(event) => {
              const name = event.currentTarget.value;
              updateCalculation(calc.id, (c) => ({ ...c, name }));
            }}
          />
          <span className="secondary">{meta.join(' · ')}</span>
          <SolverToggle
            value={calc.solver}
            onChange={(solver) =>
              updateCalculation(calc.id, (c) => ({ ...c, solver }))
            }
          />
        </div>
        <div className={layoutCss.toolbar}>
          {selectedNested.length > 0 ? (
            <Button icon="chain" onClick={expandSelected}>
              Раскрыть ({selectedNested.length})
            </Button>
          ) : (
            selected.size > 0 && (
              <Button icon="chain" onClick={() => groupSelected('workshop')}>
                В цех ({selected.size})
              </Button>
            )
          )}
          {selected.size > 0 && (
            <Button icon="factory" onClick={() => groupSelected('plant')}>
              В завод ({selected.size})
            </Button>
          )}
          <Button
            variant="primary"
            icon="plus"
            onClick={() => openDialog({ kind: 'add' })}
          >
            Рецепт
          </Button>
          <Button onClick={() => openDialog({ kind: 'workshop' })}>Цех</Button>
          <Button onClick={() => openDialog({ kind: 'plant' })}>Завод</Button>
          <span className={layoutCss.dividerV} />
          <Button
            variant="ghost"
            icon="arrowDown"
            onClick={() => openDialog({ kind: 'import' })}
          >
            Импорт
          </Button>
          <Button
            variant="ghost"
            icon="arrowUp"
            onClick={() => openDialog({ kind: 'export' })}
          >
            Экспорт
          </Button>
          <Button
            variant="ghost"
            icon="trash"
            title="Удалить расчёт"
            onClick={() => {
              if (!window.confirm(`Удалить расчёт «${calc.name}»?`)) return;
              setState((s) => ({
                ...s,
                calculations: s.calculations.filter((c) => c.id !== calc.id),
              }));
              navigate('/calc');
            }}
          />
        </div>
      </div>
      {(outdated || changes.length > 0) && (
        <div className={uiCss.banner}>
          <Icon name="alert" size={20} color="var(--status-warning)" />
          <span className="stack" style={{ gap: 2, flex: 1 }}>
            <span className="t-title">
              {outdated
                ? `Данные игры обновились: ${calc.gameVersion} → ${catalog.version}`
                : 'Рецептов нет в текущих данных игры'}
            </span>
            <span className="t-body-sm secondary">
              {changesSummary(changes)}
            </span>
          </span>
          {outdated && (
            <Button
              onClick={() => updateCalculation(calc.id, acknowledgeVersion)}
            >
              Понятно
            </Button>
          )}
        </div>
      )}
      {calc.rows.length === 0 ? (
        <EmptyCalculation openDialog={openDialog} />
      ) : (
        <RowsView
          plan={calc}
          changes={changes}
          selected={selected}
          onSelect={setSelected}
          onChange={setRows}
          onGoals={(goals) =>
            updateCalculation(calc.id, (c) => ({ ...c, goals }))
          }
          onPick={(item, rate) =>
            openDialog({ kind: 'add', item, rate, picked: true })
          }
        />
      )}
    </>
  );
};

const changesSummary = (changes: RecipeChange[]): string => {
  const changed = changes.filter((c) => c.status === 'changed').length;
  const removed = changes.filter((c) => c.status === 'removed').length;
  if (changed + removed === 0)
    return 'Расчёт пересчитан по новым данным, рецепты расчёта не изменились.';
  const parts = [
    changed > 0 ? `изменилось рецептов: ${changed}` : null,
    removed > 0 ? `удалено: ${removed}` : null,
  ].filter(Boolean);
  return `Расчёт пересчитан по новым данным: ${parts.join(', ')} — строки подсвечены.`;
};

const EmptyCalculation = ({
  openDialog,
}: {
  openDialog: (dialog: Dialog) => void;
}) => {
  const [item, setItem] = useState(DEFAULT_ITEM);
  const [rate, setRate] = useState(60);
  return (
    <div className={layoutCss.empty}>
      <Icon name="factory" size={40} color="var(--accent-primary)" />
      <h2 className="t-heading">С чего начнём?</h2>
      <span className="secondary">
        Укажите, что и сколько нужно производить, — подберём рецепт и число
        зданий.
      </span>
      <div
        className="hstack"
        style={{ alignItems: 'flex-end', width: 'min(100%, 720px)' }}
      >
        <Field label="Что производим">
          <Select
            value={item}
            options={producibleItems.map((i) => ({
              value: i.id,
              label: i.name.ru,
              icon: <GameIcon id={i.id} size="sm" />,
            }))}
            onChange={setItem}
          />
        </Field>
        <Field label="Сколько" width={180}>
          <NumberInput
            value={rate}
            min={0}
            suffix={isFluid(item) ? 'м³/мин' : 'шт/мин'}
            onChange={setRate}
          />
        </Field>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => openDialog({ kind: 'add', item, rate })}
        >
          Подобрать
        </Button>
      </div>
      <div className="hstack">
        <span className="t-body-sm muted">или добавьте</span>
        <Button onClick={() => openDialog({ kind: 'add' })}>Рецепт</Button>
        <Button onClick={() => openDialog({ kind: 'workshop' })}>Цех</Button>
        <Button onClick={() => openDialog({ kind: 'plant' })}>Завод</Button>
        <span className={layoutCss.dividerV} />
        <Button
          variant="ghost"
          icon="arrowDown"
          onClick={() => openDialog({ kind: 'import' })}
        >
          Импорт из файла
        </Button>
      </div>
    </div>
  );
};
