import { useState } from 'react';

import {
  emptyFlows,
  FLOW_EPSILON,
  type Goal,
  mergeFlows,
  type Row,
} from '../../../engine/src/calc';
import { catalog } from '../catalog';
import {
  acknowledgeVersion,
  countLabel,
  evaluate,
  signaturesFor,
  splitFlows,
  versionChanges,
} from '../calc';
import { AddRowModal } from '../components/add-row';
import { FlowChip, PowerChip } from '../components/chips';
import { ConnectModal, ExportModal } from '../components/exchange-modals';
import { Icon } from '../components/icons';
import { RowsView } from '../components/rows';
import { SolverToggle } from '../components/solver-toggle';
import { Button, Field, NumberInput } from '../components/ui';
import { newId, type AppState, type Workshop } from '../model';
import { navigate } from '../router';
import { setState, useAppState } from '../store';

const updateWorkshop = (id: string, update: (w: Workshop) => Workshop) =>
  setState((s) => ({
    ...s,
    workshops: s.workshops.map((w) => (w.id === id ? update(w) : w)),
  }));

/** Calculations and workshops that use the workshop as a row. */
const usages = (state: AppState, id: string): string[] => [
  ...state.calculations
    .filter((c) =>
      c.rows.some((r) => r.kind === 'workshop' && r.workshop === id),
    )
    .map((c) => c.name),
  ...state.workshops
    .filter((w) =>
      w.rows.some((r) => r.kind === 'workshop' && r.workshop === id),
    )
    .map((w) => `цех «${w.name}»`),
];

/** Items both produced and consumed inside the workshop — they never leave it. */
const internalFlows = (
  workshop: Workshop,
  state: AppState,
): [string, number][] => {
  const evaluation = evaluate(workshop, state);
  const produced = new Map<string, number>();
  for (const result of evaluation.rows) {
    for (const [item, perMinute] of result.flows.items) {
      if (perMinute > 0)
        produced.set(item, (produced.get(item) ?? 0) + perMinute);
    }
  }
  const total = evaluation.total.items;
  return [...produced].filter(
    ([item, perMinute]) => (total.get(item) ?? 0) < perMinute - FLOW_EPSILON,
  );
};

export const WorkshopsScreen = ({ id }: { id?: string }) => {
  const state = useAppState();
  const workshop = state.workshops.find((w) => w.id === id);
  if (id && workshop) return <WorkshopEditor workshop={workshop} />;
  const create = () => {
    const created: Workshop = {
      id: newId(),
      name: 'Новый цех',
      rows: [],
      goals: [],
      solver: 'matrix',
      gameVersion: catalog.version,
      recipeSignatures: {},
    };
    setState((s) => ({ ...s, workshops: [...s.workshops, created] }));
    navigate(`/workshops/${created.id}`);
  };
  return (
    <main className="content">
      <div className="page-header">
        <div className="heading">
          <h1 className="t-display">Цеха</h1>
          <span className="secondary">
            Цех — готовая цепь рецептов, как чертёж: подключается в расчёт одним
            блоком со своим входом, выходом и энергией.
          </span>
        </div>
        <Button variant="primary" icon="plus" onClick={create}>
          Новый цех
        </Button>
      </div>
      {state.workshops.length === 0 ? (
        <div className="empty">
          <Icon name="chain" size={40} color="var(--accent-primary)" />
          <span className="secondary">
            Цехов пока нет. Создайте цех здесь или выделите строки в расчёте и
            нажмите «В цех».
          </span>
        </div>
      ) : (
        <div className="cards">
          {state.workshops.map((w) => {
            const total = evaluate(w, state).total;
            const { inputs, outputs } = splitFlows(total.items);
            const used = usages(state, w.id);
            return (
              <a key={w.id} className="card link" href={`#/workshops/${w.id}`}>
                <span className="hstack">
                  <Icon name="chain" color="var(--accent-primary)" />
                  <span className="t-title">{w.name}</span>
                </span>
                <span className="t-body-sm muted">
                  {countLabel(w.rows.length, 'строка', 'строки', 'строк')} ·{' '}
                  {countLabel(total.buildings, 'здание', 'здания', 'зданий')}
                </span>
                <div className="flows">
                  {inputs.map(([item, v]) => (
                    <FlowChip
                      key={item}
                      item={item}
                      perMinute={v}
                      units={state.units}
                    />
                  ))}
                </div>
                <div className="flows">
                  {outputs.map(([item, v]) => (
                    <FlowChip
                      key={item}
                      item={item}
                      perMinute={v}
                      units={state.units}
                    />
                  ))}
                  {total.powerMW !== 0 && <PowerChip powerMW={total.powerMW} />}
                </div>
                <span className="t-body-sm muted">
                  {used.length > 0
                    ? `Используется: ${used.join(', ')}`
                    : 'Пока нигде не используется'}
                </span>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
};

type Dialog =
  | { kind: 'add'; item?: string; rate?: number }
  | { kind: 'workshop' | 'export' };

const WorkshopEditor = ({ workshop }: { workshop: Workshop }) => {
  const state = useAppState();
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [scale, setScale] = useState(1);
  const total = mergeFlows(
    emptyFlows(),
    evaluate(workshop, state).total,
    scale,
  );
  const { inputs, outputs } = splitFlows(total.items);
  const internal = internalFlows(workshop, state);
  const used = usages(state, workshop.id);
  const changes = versionChanges(workshop);
  const close = () => setDialog(null);
  const addRow = (row: Row, goal?: Goal) => {
    updateWorkshop(workshop.id, (w) => ({
      ...w,
      rows: [...w.rows, row],
      goals: goal
        ? [...w.goals.filter((g) => g.item !== goal.item), goal]
        : w.goals,
      recipeSignatures: { ...w.recipeSignatures, ...signaturesFor([row]) },
    }));
    close();
  };
  return (
    <div className="page">
      <main className="content">
        <div className="page-header">
          <div className="heading">
            <a href="#/workshops" className="t-body-sm muted">
              ← Все цеха
            </a>
            <input
              className="t-display"
              style={{ background: 'none', border: 0, outline: 'none' }}
              value={workshop.name}
              aria-label="Название цеха"
              onChange={(event) =>
                updateWorkshop(workshop.id, (w) => ({
                  ...w,
                  name: event.target.value,
                }))
              }
            />
            <SolverToggle
              value={workshop.solver}
              onChange={(solver) =>
                updateWorkshop(workshop.id, (w) => ({ ...w, solver }))
              }
            />
          </div>
          <div className="toolbar">
            <Button
              variant="primary"
              icon="plus"
              onClick={() => setDialog({ kind: 'add' })}
            >
              Рецепт
            </Button>
            <Button onClick={() => setDialog({ kind: 'workshop' })}>Цех</Button>
            <span className="divider-v" />
            <Button
              variant="ghost"
              icon="arrowUp"
              onClick={() => setDialog({ kind: 'export' })}
            >
              Экспорт
            </Button>
            <Button
              variant="ghost"
              icon="trash"
              title="Удалить цех"
              onClick={() => {
                if (used.length > 0) {
                  window.alert(
                    `Цех используется: ${used.join(', ')}. Сначала уберите его оттуда.`,
                  );
                  return;
                }
                if (!window.confirm(`Удалить цех «${workshop.name}»?`)) return;
                setState((s) => ({
                  ...s,
                  workshops: s.workshops.filter((w) => w.id !== workshop.id),
                }));
                navigate('/workshops');
              }}
            />
          </div>
        </div>
        {workshop.gameVersion !== catalog.version && (
          <div className="banner">
            <Icon name="alert" color="var(--status-warning)" />
            <span style={{ flex: 1 }}>
              Данные игры обновились: {workshop.gameVersion} → {catalog.version}
              . Изменённые и удалённые рецепты подсвечены.
            </span>
            <Button
              onClick={() => updateWorkshop(workshop.id, acknowledgeVersion)}
            >
              Понятно
            </Button>
          </div>
        )}
        {workshop.rows.length === 0 ? (
          <div className="empty">
            <span className="secondary">
              Добавьте рецепты цепи — интерфейс цеха посчитается сам.
            </span>
          </div>
        ) : (
          <RowsView
            plan={workshop}
            onGoals={(goals) =>
              updateWorkshop(workshop.id, (w) => ({ ...w, goals }))
            }
            changes={changes}
            selected={selected}
            onSelect={setSelected}
            onChange={(rows) =>
              updateWorkshop(workshop.id, (w) => ({ ...w, rows }))
            }
            onPick={(item, rate) => setDialog({ kind: 'add', item, rate })}
          />
        )}
      </main>
      <aside className="panel" style={{ margin: '24px 24px 0 0' }}>
        <span className="t-title">Интерфейс цеха</span>
        <Field label="Масштаб" width={140}>
          <NumberInput
            value={scale}
            min={1}
            step={1}
            suffix="×"
            onChange={(v) => setScale(v || 1)}
          />
        </Field>
        <span className="t-label muted">Вход</span>
        <div className="flows">
          {inputs.length === 0 && <span className="muted t-body-sm">нет</span>}
          {inputs.map(([item, v]) => (
            <FlowChip
              key={item}
              item={item}
              perMinute={v}
              units={state.units}
            />
          ))}
        </div>
        <span className="t-label muted">Выход</span>
        <div className="flows">
          {outputs.length === 0 && <span className="muted t-body-sm">нет</span>}
          {outputs.map(([item, v]) => (
            <FlowChip
              key={item}
              item={item}
              perMinute={v}
              units={state.units}
            />
          ))}
        </div>
        <span className="t-label muted">Энергия</span>
        <div>{<PowerChip powerMW={total.powerMW} />}</div>
        <span className="t-label muted">Внутренние потоки</span>
        <div className="flows">
          {internal.length === 0 && (
            <span className="muted t-body-sm">нет</span>
          )}
          {internal.map(([item, v]) => (
            <FlowChip
              key={item}
              item={item}
              perMinute={v * scale}
              units={state.units}
            />
          ))}
        </div>
        <span className="t-label muted">Где используется</span>
        <span className="t-body-sm secondary">
          {used.length > 0 ? used.join(', ') : 'нигде'}
        </span>
      </aside>
      {dialog?.kind === 'add' && (
        <AddRowModal
          initialItem={dialog.item}
          initialRate={dialog.rate}
          onClose={close}
          onAdd={(row, goal) =>
            addRow(
              row.kind === 'recipe' || row.kind === 'extractor'
                ? { ...row, sizing: 'auto' }
                : row,
              dialog.item ? undefined : goal,
            )
          }
        />
      )}
      {dialog?.kind === 'workshop' && (
        <ConnectModal
          kind="workshop"
          excludeWorkshop={workshop.id}
          onClose={close}
          onAdd={addRow}
        />
      )}
      {dialog?.kind === 'export' && (
        <ExportModal initial={{ workshop: workshop.id }} onClose={close} />
      )}
    </div>
  );
};
