import { useState } from 'react';

import {
  emptyFlows,
  FLOW_EPSILON,
  type Goal,
  mergeFlows,
  type Row,
} from '../engine';
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
import { cx } from '../cx';
import layoutCss from './layout.module.css';
import uiCss from '../components/ui.module.css';
import { t } from '../i18n';

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
    .map((w) => t.workshops.usedIn(w.name)),
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
      name: t.workshops.newName,
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
    <main className={layoutCss.content}>
      <div className={layoutCss.pageHeader}>
        <div className={layoutCss.heading}>
          <h1 className="t-display">{t.nav.workshops}</h1>
          <span className="secondary">{t.workshops.lead}</span>
        </div>
        <Button variant="primary" icon="plus" onClick={create}>
          {t.workshops.newName}
        </Button>
      </div>
      {state.workshops.length === 0 ? (
        <div className={layoutCss.empty}>
          <Icon name="chain" size={40} color="var(--accent-primary)" />
          <span className="secondary">{t.workshops.empty}</span>
        </div>
      ) : (
        <div className={layoutCss.cards}>
          {state.workshops.map((w) => {
            const total = evaluate(w, state).total;
            const { inputs, outputs } = splitFlows(total.items);
            const used = usages(state, w.id);
            return (
              <a
                key={w.id}
                className={cx(layoutCss.card, layoutCss.link)}
                href={`#/workshops/${w.id}`}
              >
                <span className="hstack">
                  <Icon name="chain" color="var(--accent-primary)" />
                  <span className="t-title">{w.name}</span>
                </span>
                <span className="t-body-sm muted">
                  {countLabel(w.rows.length, t.count.rows)} ·{' '}
                  {countLabel(total.buildings, t.count.buildings)}
                </span>
                <div className={uiCss.flows}>
                  {inputs.map(([item, v]) => (
                    <FlowChip
                      key={item}
                      item={item}
                      perMinute={v}
                      units={state.units}
                    />
                  ))}
                </div>
                <div className={uiCss.flows}>
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
                    ? t.workshops.used(used.join(', '))
                    : t.workshops.unused}
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
    <div className={layoutCss.page}>
      <main className={layoutCss.content}>
        <div className={layoutCss.pageHeader}>
          <div className={layoutCss.heading}>
            <a href="#/workshops" className="t-body-sm muted">
              {t.workshops.back}
            </a>
            <input
              className="t-display"
              style={{ background: 'none', border: 0, outline: 'none' }}
              value={workshop.name}
              aria-label={t.workshops.nameAria}
              onChange={(event) => {
                const name = event.currentTarget.value;
                updateWorkshop(workshop.id, (w) => ({ ...w, name }));
              }}
            />
            <SolverToggle
              value={workshop.solver}
              onChange={(solver) =>
                updateWorkshop(workshop.id, (w) => ({ ...w, solver }))
              }
            />
          </div>
          <div className={layoutCss.toolbar}>
            <Button
              variant="primary"
              icon="plus"
              onClick={() => setDialog({ kind: 'add' })}
            >
              {t.plan.recipe}
            </Button>
            <Button onClick={() => setDialog({ kind: 'workshop' })}>
              {t.plan.workshop}
            </Button>
            <span className={layoutCss.dividerV} />
            <Button
              variant="ghost"
              icon="arrowUp"
              onClick={() => setDialog({ kind: 'export' })}
            >
              {t.plan.export}
            </Button>
            <Button
              variant="ghost"
              icon="trash"
              title={t.workshops.delete}
              onClick={() => {
                if (used.length > 0) {
                  window.alert(t.workshops.deleteUsed(used.join(', ')));
                  return;
                }
                if (!window.confirm(t.workshops.deleteConfirm(workshop.name)))
                  return;
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
          <div className={uiCss.banner}>
            <Icon name="alert" color="var(--status-warning)" />
            <span style={{ flex: 1 }}>
              {t.workshops.versionChanged(
                workshop.gameVersion,
                catalog.version,
              )}
            </span>
            <Button
              onClick={() => updateWorkshop(workshop.id, acknowledgeVersion)}
            >
              {t.plan.acknowledge}
            </Button>
          </div>
        )}
        {workshop.rows.length === 0 ? (
          <div className={layoutCss.empty}>
            <span className="secondary">{t.workshops.emptyRows}</span>
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
      <aside className={layoutCss.panel} style={{ margin: '24px 24px 0 0' }}>
        <span className="t-title">{t.workshops.interface}</span>
        <Field label={t.workshops.scale} width={140}>
          <NumberInput
            value={scale}
            min={1}
            step={1}
            suffix="×"
            onChange={(v) => setScale(v || 1)}
          />
        </Field>
        <span className="t-label muted">{t.workshops.input}</span>
        <div className={uiCss.flows}>
          {inputs.length === 0 && (
            <span className="muted t-body-sm">{t.workshops.none}</span>
          )}
          {inputs.map(([item, v]) => (
            <FlowChip
              key={item}
              item={item}
              perMinute={v}
              units={state.units}
            />
          ))}
        </div>
        <span className="t-label muted">{t.workshops.output}</span>
        <div className={uiCss.flows}>
          {outputs.length === 0 && (
            <span className="muted t-body-sm">{t.workshops.none}</span>
          )}
          {outputs.map(([item, v]) => (
            <FlowChip
              key={item}
              item={item}
              perMinute={v}
              units={state.units}
            />
          ))}
        </div>
        <span className="t-label muted">{t.workshops.power}</span>
        <div>{<PowerChip powerMW={total.powerMW} />}</div>
        <span className="t-label muted">{t.workshops.internal}</span>
        <div className={uiCss.flows}>
          {internal.length === 0 && (
            <span className="muted t-body-sm">{t.workshops.none}</span>
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
        <span className="t-label muted">{t.workshops.usedWhere}</span>
        <span className="t-body-sm secondary">
          {used.length > 0 ? used.join(', ') : t.workshops.nowhere}
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
