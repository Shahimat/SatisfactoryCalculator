import { useCallback, useState } from 'react';

import {
  emptyFlows,
  FLOW_EPSILON,
  type Goal,
  mergeFlows,
  type RecipeChange,
  type Row,
} from '../engine';
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
import { localName, t } from '../i18n';

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
  const calc = newCalculation(t.calc.newName);
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
                  ? t.calc.emptyShort
                  : `${countLabel(c.rows.length, t.count.rows)} · ${signed(power, 1)} ${t.units.mw}`}
              </span>
            </a>
          );
        })}
        <div>
          <Button variant="ghost" icon="plus" onClick={createCalculation}>
            {t.calc.newName}
          </Button>
        </div>
      </aside>
      <main className={layoutCss.content}>
        {calc ? (
          <CalculationView calc={calc} openDialog={setDialog} />
        ) : (
          <div className={layoutCss.empty}>
            <Icon name="factory" size={40} color="var(--accent-primary)" />
            <h2 className="t-heading">{t.calc.none}</h2>
            <div className="hstack">
              <Button variant="primary" icon="plus" onClick={createCalculation}>
                {t.calc.newName}
              </Button>
              <Button
                variant="ghost"
                icon="arrowDown"
                onClick={() => setDialog({ kind: 'import' })}
              >
                {t.calc.importFile}
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
              {
                ...plan,
                name: t.calc.workshopFrom(calc.name),
              } satisfies Workshop,
            ],
            calculations,
          }
        : {
            ...s,
            calculations: [
              ...calculations,
              {
                ...plan,
                name: t.calc.plantFrom(calc.name),
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
    countLabel(calc.rows.length, t.count.rows),
    countLabel(build.placed, t.count.buildings),
    somersloops > 0 ? countLabel(somersloops, t.count.somersloops) : null,
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
            aria-label={t.calc.nameAria}
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
              {t.calc.expand(selectedNested.length)}
            </Button>
          ) : (
            selected.size > 0 && (
              <Button icon="chain" onClick={() => groupSelected('workshop')}>
                {t.calc.toWorkshop(selected.size)}
              </Button>
            )
          )}
          {selected.size > 0 && (
            <Button icon="factory" onClick={() => groupSelected('plant')}>
              {t.calc.toPlant(selected.size)}
            </Button>
          )}
          <Button
            variant="primary"
            icon="plus"
            onClick={() => openDialog({ kind: 'add' })}
          >
            {t.plan.recipe}
          </Button>
          <Button onClick={() => openDialog({ kind: 'workshop' })}>
            {t.plan.workshop}
          </Button>
          <Button onClick={() => openDialog({ kind: 'plant' })}>
            {t.plan.plant}
          </Button>
          <span className={layoutCss.dividerV} />
          <Button
            variant="ghost"
            icon="arrowDown"
            onClick={() => openDialog({ kind: 'import' })}
          >
            {t.plan.import}
          </Button>
          <Button
            variant="ghost"
            icon="arrowUp"
            onClick={() => openDialog({ kind: 'export' })}
          >
            {t.plan.export}
          </Button>
          <Button
            variant="ghost"
            icon="trash"
            title={t.calc.delete}
            onClick={() => {
              if (!window.confirm(t.calc.deleteConfirm(calc.name))) return;
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
                ? t.calc.versionChanged(calc.gameVersion, catalog.version)
                : t.calc.recipesMissing}
            </span>
            <span className="t-body-sm secondary">
              {changesSummary(changes)}
            </span>
          </span>
          {outdated && (
            <Button
              onClick={() => updateCalculation(calc.id, acknowledgeVersion)}
            >
              {t.plan.acknowledge}
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
  if (changed + removed === 0) return t.calc.recalculatedSame;
  const parts = [
    changed > 0 ? t.calc.changedCount(changed) : null,
    removed > 0 ? t.calc.removedCount(removed) : null,
  ].filter(Boolean);
  return t.calc.recalculated(parts.join(', '));
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
      <h2 className="t-heading">{t.calc.start}</h2>
      <span className="secondary">{t.calc.startLead}</span>
      <div
        className="hstack"
        style={{ alignItems: 'flex-end', width: 'min(100%, 720px)' }}
      >
        <Field label={t.addRow.product}>
          <Select
            value={item}
            options={producibleItems().map((i) => ({
              value: i.id,
              label: localName(i),
              icon: <GameIcon id={i.id} size="sm" />,
            }))}
            onChange={setItem}
          />
        </Field>
        <Field label={t.calc.howMuch} width={180}>
          <NumberInput
            value={rate}
            min={0}
            suffix={isFluid(item) ? t.units.fluid : t.units.ipm}
            onChange={setRate}
          />
        </Field>
        <Button
          variant="primary"
          icon="plus"
          onClick={() => openDialog({ kind: 'add', item, rate })}
        >
          {t.calc.pick}
        </Button>
      </div>
      <div className="hstack">
        <span className="t-body-sm muted">{t.calc.orAdd}</span>
        <Button onClick={() => openDialog({ kind: 'add' })}>
          {t.plan.recipe}
        </Button>
        <Button onClick={() => openDialog({ kind: 'workshop' })}>
          {t.plan.workshop}
        </Button>
        <Button onClick={() => openDialog({ kind: 'plant' })}>
          {t.plan.plant}
        </Button>
        <span className={layoutCss.dividerV} />
        <Button
          variant="ghost"
          icon="arrowDown"
          onClick={() => openDialog({ kind: 'import' })}
        >
          {t.calc.importFile}
        </Button>
      </div>
    </div>
  );
};
