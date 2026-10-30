import { Fragment, useState } from 'react';

import {
  mergeFlows,
  emptyFlows,
  type Goal,
  type RecipeChange,
  type Row,
} from '../engine';
import { buildingName, catalog, itemName, recipes } from '../catalog';
import {
  type BuildList,
  buildList,
  evaluate,
  lastCopyLoad,
  placedCopies,
  plain,
  type RowResult,
  splitFlows,
} from '../calc';
import { newId, type Plan, type Units } from '../model';
import { useAppState } from '../store';
import {
  type AmountEdit,
  FactoryChip,
  FlowChip,
  type PickItem,
  PowerChip,
} from './chips';
import { BuildingModal } from './building-modal';
import { EditRowModal } from './edit-row';
import { Icon } from './icons';
import { GameIcon, IconButton } from './ui';
import { cx } from '../cx';
import chipsCss from './chips.module.css';
import rowsCss from './rows.module.css';
import uiCss from './ui.module.css';
import { localName, t } from '../i18n';

type RowsViewProps = {
  plan: Plan;
  changes: RecipeChange[];
  selected: Set<string>;
  onSelect: (selected: Set<string>) => void;
  onChange: (rows: Row[]) => void;
  onGoals: (goals: Goal[]) => void;
  /** Consumed item clicked: offer a recipe or extraction for it. */
  onPick?: PickItem;
};

export const RowsView = ({
  plan,
  changes,
  selected,
  onSelect,
  onChange,
  onGoals,
  onPick,
}: RowsViewProps) => {
  const { rows } = plan;
  const state = useAppState();
  const evaluation = evaluate(plan, state);
  // The plan's output of an item: a goal, which also releases rows locked on
  // that item, so the total is what the user typed, not a lock's leftover.
  const goalEdit: ItemEdit = (item, perMinute) => {
    const goal = plan.goals.find((g) => g.item === item);
    const others = plan.goals.filter((g) => g.item !== item);
    const lockedOn = (row: Row) => 'output' in row && row.output?.item === item;
    return {
      mark: goal ? 'goal' : rows.some(lockedOn) ? 'lock' : undefined,
      initial: goal?.perMinute ?? perMinute,
      empty: t.rows.goalEmpty,
      title: t.rows.goalTitle,
      onCommit: (value) => {
        if (rows.some(lockedOn)) {
          onChange(
            rows.map((row) =>
              lockedOn(row)
                ? ({ ...row, output: undefined, sizing: 'auto' } as Row)
                : row,
            ),
          );
        }
        onGoals(
          value === undefined
            ? others
            : [...others, { item, perMinute: value }],
        );
      },
    };
  };
  const [editing, setEditing] = useState<{
    row: Row;
    solved: Row;
    auto: boolean;
  } | null>(null);
  const [inspecting, setInspecting] = useState<RowResult | null>(null);
  const build = buildList(evaluation, state);
  const [dragging, setDragging] = useState<string | null>(null);
  const [drop, setDrop] = useState<{ id: string; after: boolean } | null>(null);
  const move = (id: string, target: string, after: boolean) => {
    if (id === target) return;
    const moving = rows.find((r) => r.id === id);
    if (!moving) return;
    const rest = rows.filter((r) => r.id !== id);
    const index = rest.findIndex((r) => r.id === target) + (after ? 1 : 0);
    onChange([...rest.slice(0, index), moving, ...rest.slice(index)]);
  };
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const replace = (row: Row) =>
    onChange(rows.map((r) => (r.id === row.id ? row : r)));
  const remove = (id: string) => onChange(rows.filter((r) => r.id !== id));
  const duplicate = (row: Row) => {
    const index = rows.findIndex((r) => r.id === row.id);
    onChange([
      ...rows.slice(0, index + 1),
      { ...row, id: newId() },
      ...rows.slice(index + 1),
    ]);
  };
  const toggle = (set: Set<string>, id: string) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  };

  return (
    <>
      <div className={rowsCss.calcHead}>
        <div className={cx(rowsCss.colHeader, 't-label')}>
          <span />
          <span>{t.rows.columns.recipe}</span>
          <span>{t.rows.columns.buildings}</span>
          <span>{t.rows.columns.consumption}</span>
          <span />
          <span>{t.rows.columns.production}</span>
          <span>{t.rows.columns.power}</span>
          <span />
        </div>
        <TotalRow
          total={evaluation.total}
          build={build}
          units={state.units}
          onPick={onPick}
          edit={goalEdit}
        />
        {evaluation.infeasible && (
          <div className={cx(uiCss.banner, uiCss.error)}>
            <Icon name="alert" size={20} color="var(--status-deficit)" />
            <span className="t-body-sm">{t.rows.infeasible}</span>
          </div>
        )}
      </div>
      <div className={rowsCss.rows}>
        {evaluation.rows.map((result) => (
          <Fragment key={result.row.id}>
            <RowView
              result={result}
              dragging={dragging === result.row.id}
              drop={drop?.id === result.row.id ? drop : undefined}
              onDragStart={() => setDragging(result.row.id)}
              onDragOver={(after) => setDrop({ id: result.row.id, after })}
              onDragEnd={() => {
                if (dragging && drop) move(dragging, drop.id, drop.after);
                setDragging(null);
                setDrop(null);
              }}
              units={state.units}
              change={changes.find(
                (c) =>
                  result.row.kind === 'recipe' &&
                  c.recipe === result.row.recipe,
              )}
              selected={selected.has(result.row.id)}
              expanded={expanded.has(result.row.id)}
              onSelect={() => onSelect(toggle(selected, result.row.id))}
              onExpand={() => setExpanded(toggle(expanded, result.row.id))}
              onEdit={() =>
                setEditing({
                  row: result.source,
                  solved: result.row,
                  auto: result.auto,
                })
              }
              onInspect={() => setInspecting(result)}
              onDuplicate={() => duplicate(result.source)}
              onRemove={() => remove(result.row.id)}
              onPick={onPick}
              onLock={replace}
              goals={plan.goals}
              onGoals={onGoals}
              solver={plan.solver}
            />
            {result.row.kind === 'workshop' && expanded.has(result.row.id) && (
              <NestedRows row={result.row} units={state.units} />
            )}
          </Fragment>
        ))}
      </div>
      <BuildCost cost={build.cost} />
      {editing && (
        <EditRowModal
          row={editing.row}
          solved={editing.solved}
          auto={editing.auto}
          solver={plan.solver}
          onClose={() => setEditing(null)}
          onSave={(row) => {
            replace(row);
            setEditing(null);
          }}
        />
      )}
      {inspecting && (
        <BuildingModal
          result={inspecting}
          onClose={() => setInspecting(null)}
        />
      )}
    </>
  );
};

/** How a chip's amount is typed in, if it can be. */
type ItemEdit = (item: string, perMinute: number) => AmountEdit | undefined;

const FlowsCell = ({
  flows,
  units,
  onPick,
  edit,
}: {
  flows: [string, number][];
  units: Units;
  onPick?: PickItem;
  edit?: ItemEdit;
}) => (
  <div className={cx(uiCss.flows, rowsCss.dim)}>
    {flows.map(([item, perMinute]) => (
      <FlowChip
        key={item}
        item={item}
        perMinute={perMinute}
        units={units}
        onPick={onPick}
        edit={edit?.(item, perMinute)}
      />
    ))}
  </div>
);

const RowView = ({
  result,
  dragging,
  drop,
  onDragStart,
  onDragOver,
  onDragEnd,
  units,
  change,
  selected,
  expanded,
  onSelect,
  onExpand,
  onEdit,
  onInspect,
  onDuplicate,
  onRemove,
  onPick,
  onLock,
  goals,
  onGoals,
  solver,
}: {
  result: RowResult;
  dragging: boolean;
  drop?: { after: boolean };
  onDragStart: () => void;
  onDragOver: (after: boolean) => void;
  onDragEnd: () => void;
  units: Units;
  change?: RecipeChange;
  selected: boolean;
  expanded: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onEdit: () => void;
  /** Building chip clicked: what the buildings of the row do. */
  onInspect: () => void;
  onDuplicate: () => void;
  onRemove: () => void;
  onPick?: PickItem;
  /** Saves the row locked at an output or back to auto. */
  onLock: (row: Row) => void;
  goals: Goal[];
  onGoals: (goals: Goal[]) => void;
  solver: Plan['solver'];
}) => {
  const state = useAppState();
  const { row, flows } = result;
  const { inputs, outputs } = splitFlows(flows.items);
  const status =
    change?.status ?? (result.error === 'removed' ? 'removed' : undefined);
  const header = rowHeader(row, state);
  const [armed, setArmed] = useState(false);
  const idle = result.auto && flows.buildings === 0 && !result.error;
  const { source } = result;
  const sizable = source.kind === 'recipe' || source.kind === 'extractor';
  const fixed = source.kind !== 'generator' && !result.auto;
  const locked = sizable ? source.output : undefined;
  const lockEdit: ItemEdit | undefined = sizable
    ? (item, perMinute) => {
        const goal = goals.some((g) => g.item === item);
        return {
          mark: locked?.item === item ? 'lock' : goal ? 'goal' : undefined,
          initial: locked?.item === item ? locked.perMinute : perMinute,
          empty: t.chips.auto,
          title: t.rows.lockTitle,
          onCommit: (value) => {
            if (value !== undefined) {
              onLock({
                ...source,
                output: { item, perMinute: value },
                sizing: 'fixed',
              });
              return;
            }
            // Empty means nothing is asked of this product: no lock, no goal.
            onLock({ ...source, output: undefined, sizing: 'auto' });
            if (goal) onGoals(goals.filter((g) => g.item !== item));
          },
        };
      }
    : undefined;
  return (
    <div
      className={cx(
        rowsCss.row,
        selected && rowsCss.selected,
        fixed && rowsCss.fixed,
        status && rowsCss[status],
        dragging && rowsCss.dragging,
        drop && (drop.after ? rowsCss.dropAfter : rowsCss.dropBefore),
      )}
      draggable={armed}
      onDragStart={(event) => {
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragOver={(event) => {
        event.preventDefault();
        const box = event.currentTarget.getBoundingClientRect();
        onDragOver(event.clientY > box.top + box.height / 2);
      }}
      onDrop={(event) => event.preventDefault()}
      onDragEnd={() => {
        setArmed(false);
        onDragEnd();
      }}
      onClick={(event) => {
        // Controls inside the card keep their own clicks; the card itself selects.
        const target = event.target as HTMLElement;
        if (!target.closest('button, a, input, .grip, [role="button"]'))
          onSelect();
      }}
    >
      <div className={rowsCss.lead}>
        <span
          className={rowsCss.grip}
          title={t.rows.drag}
          onMouseDown={() => setArmed(true)}
          onMouseUp={() => setArmed(false)}
        >
          <Icon name="grip" size={16} />
        </span>
        {row.kind === 'workshop' && (
          <IconButton
            icon={expanded ? 'chevronDown' : 'chevronRight'}
            title={expanded ? t.rows.collapse : t.rows.expand}
            onClick={onExpand}
          />
        )}
      </div>
      <div className={rowsCss.name}>
        <span className={rowsCss.title}>
          <span
            role="button"
            tabIndex={0}
            className={rowsCss.titleButton}
            title={t.rows.configure}
            onClick={onEdit}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onEdit();
              }
            }}
          >
            {header.icon && (
              <Icon
                name={header.icon}
                size={18}
                color="var(--accent-primary)"
              />
            )}
            {header.title}
            {header.alt && (
              <span className={cx(uiCss.badge, uiCss.alt)}>ALT</span>
            )}
          </span>
          {row.kind === 'plant' && (
            <a
              href={`#/calc/${row.calculation}`}
              title={t.rows.openCalculation}
              className="muted"
            >
              <Icon name="external" size={14} />
            </a>
          )}
        </span>
        {status === 'removed' ? (
          <span className={cx(rowsCss.meta, rowsCss.error)}>
            {t.rows.removed(catalog.version)}
          </span>
        ) : status === 'changed' ? (
          <span className={cx(rowsCss.meta, rowsCss.warn)}>
            {t.rows.changed(catalog.version)}
          </span>
        ) : result.error ? (
          <span className={cx(rowsCss.meta, rowsCss.error)}>
            {result.error}
          </span>
        ) : idle ? (
          <span className={cx(rowsCss.meta, rowsCss.warn)}>
            {solver === 'sequential' ? t.rows.idleSequential : t.rows.idle}
          </span>
        ) : (
          header.meta && <span className={rowsCss.meta}>{header.meta}</span>
        )}
      </div>
      <div className={rowsCss.dim}>
        {row.kind === 'recipe' ||
        row.kind === 'extractor' ||
        row.kind === 'generator' ? (
          <FactoryChip
            building={
              row.kind === 'recipe'
                ? (recipes.get(row.recipe)?.building ?? '')
                : row.building
            }
            groups={row.groups}
            auto={result.auto}
            fixed={fixed && !locked}
            title={t.rows.buildingsTitle}
            onClick={onInspect}
          />
        ) : (
          <button
            type="button"
            className={chipsCss.factoryChip}
            onClick={onEdit}
            title={t.rows.editCopies}
          >
            <span className={chipsCss.groups}>
              <span className={chipsCss.group}>
                <span className={chipsCss.count}>
                  ×{placedCopies(row.copies)}
                </span>
                {lastCopyLoad(row.copies) !== undefined && (
                  <span
                    className={cx(uiCss.tag, uiCss.warn)}
                    title={t.rows.lastCopyTitle}
                  >
                    <Icon name="gauge" size={12} />
                    {t.rows.lastCopy(plain(lastCopyLoad(row.copies)! * 100, 2))}
                  </span>
                )}
              </span>
              <span className="hstack" style={{ gap: 6 }}>
                <span className="t-body-sm muted">
                  {row.kind === 'workshop'
                    ? t.rows.workshopCopies
                    : t.rows.plantCopies}
                </span>
                {result.auto ? (
                  <span className={uiCss.tag} title={t.rows.autoCopiesTitle}>
                    {t.chips.auto}
                  </span>
                ) : (
                  <span
                    className={cx(uiCss.tag, uiCss.fixed)}
                    title={t.rows.fixedCopiesTitle}
                  >
                    <Icon name="lock" size={12} />
                    {t.chips.fixed}
                  </span>
                )}
              </span>
            </span>
          </button>
        )}
      </div>
      <FlowsCell flows={inputs} units={units} onPick={onPick} />
      <Icon name="arrowRight" size={20} color="var(--text-muted)" />
      <FlowsCell flows={outputs} units={units} edit={lockEdit} />
      <div className={rowsCss.dim}>
        {flows.powerMW !== 0 && <PowerChip powerMW={flows.powerMW} />}
      </div>
      <div className={rowsCss.actions}>
        <IconButton
          icon="copy"
          title={t.rows.duplicate}
          onClick={onDuplicate}
        />
        <IconButton icon="close" title={t.rows.remove} onClick={onRemove} />
      </div>
    </div>
  );
};

/** Title of a row; the building and its rate are on the building chip. */
const rowHeader = (
  row: Row,
  state: ReturnType<typeof useAppState>,
): {
  title: string;
  meta?: string;
  icon?: 'chain' | 'factory';
  alt?: boolean;
} => {
  switch (row.kind) {
    case 'recipe': {
      const recipe = recipes.get(row.recipe);
      return recipe
        ? { title: localName(recipe), alt: recipe.alternate }
        : { title: row.recipe };
    }
    case 'extractor': {
      return {
        title: itemName(row.resource),
        meta: t.rows.node(t.rows.purity[row.purity]),
      };
    }
    case 'generator': {
      return { title: buildingName(row.building) };
    }
    case 'workshop': {
      const workshop = state.workshops.find((w) => w.id === row.workshop);
      return {
        title: workshop?.name ?? t.rows.workshopRemoved,
        icon: 'chain',
        meta: workshop ? undefined : t.rows.workshopMissing,
      };
    }
    case 'plant': {
      const calc = state.calculations.find((c) => c.id === row.calculation);
      return {
        title: calc?.name ?? t.rows.calculationRemoved,
        icon: 'factory',
      };
    }
  }
};

const NestedRows = ({
  row,
  units,
}: {
  row: Extract<Row, { kind: 'workshop' }>;
  units: Units;
}) => {
  const state = useAppState();
  const workshop = state.workshops.find((w) => w.id === row.workshop);
  if (!workshop) return null;
  const evaluation = evaluate(workshop, state);
  return (
    <>
      {evaluation.rows.map((result) => {
        const scaled = mergeFlows(emptyFlows(), result.flows, row.copies);
        const { inputs, outputs } = splitFlows(scaled.items);
        const header = rowHeader(result.row, state);
        return (
          <div className={cx(rowsCss.row, rowsCss.nested)} key={result.row.id}>
            <div className={rowsCss.lead} />
            <div className={rowsCss.name}>
              <span className={rowsCss.title}>
                {header.title}
                {header.alt && (
                  <span className={cx(uiCss.badge, uiCss.alt)}>ALT</span>
                )}
              </span>
              {header.meta && (
                <span className={rowsCss.meta}>{header.meta}</span>
              )}
            </div>
            <div>
              {'groups' in result.row && (
                <FactoryChip
                  building={
                    result.row.kind === 'recipe'
                      ? (recipes.get(result.row.recipe)?.building ?? '')
                      : result.row.building
                  }
                  groups={result.row.groups.map((g) => ({
                    ...g,
                    count: g.count * row.copies,
                  }))}
                />
              )}
            </div>
            <FlowsCell flows={inputs} units={units} />
            <Icon name="arrowRight" size={20} color="var(--text-muted)" />
            <FlowsCell flows={outputs} units={units} />
            <div>
              {scaled.powerMW !== 0 && <PowerChip powerMW={scaled.powerMW} />}
            </div>
            <div />
          </div>
        );
      })}
    </>
  );
};

const TotalRow = ({
  total,
  build,
  units,
  onPick,
  edit,
}: {
  total: ReturnType<typeof evaluate>['total'];
  build: BuildList;
  units: Units;
  onPick?: PickItem;
  edit: ItemEdit;
}) => {
  const { inputs, outputs } = splitFlows(total.items);
  return (
    <div className={cx(rowsCss.row, rowsCss.total)}>
      <div />
      <div className={rowsCss.name}>
        <span className="t-heading">{t.rows.total}</span>
      </div>
      <BuildCell build={build} />
      <FlowsCell flows={inputs} units={units} onPick={onPick} />
      <Icon name="arrowRight" size={20} color="var(--text-muted)" />
      <FlowsCell flows={outputs} units={units} edit={edit} />
      <div>{total.powerMW !== 0 && <PowerChip powerMW={total.powerMW} />}</div>
      <div />
    </div>
  );
};

/** Whole buildings, workshops and plants the plan asks to place; names on hover. */
const BuildCell = ({ build }: { build: BuildList }) => {
  const entries = [...build.buildings].sort(([, a], [, b]) => b - a);
  return (
    <div className={rowsCss.buildCell}>
      {entries.map(([building, count]) => (
        <span
          className={cx(chipsCss.buildChip, chipsCss.compact)}
          key={building}
          title={buildingName(building)}
        >
          <GameIcon id={building} size="sm" />
          <span className="t-num">×{count}</span>
        </span>
      ))}
      {build.workshops.map((w) => (
        <a
          className={cx(chipsCss.buildChip, chipsCss.compact)}
          key={w.id}
          href={`#/workshops/${w.id}`}
          title={t.rows.workshopChip(w.name)}
        >
          <Icon name="chain" size={20} color="var(--accent-primary)" />
          <span className="t-num">×{plain(w.copies)}</span>
          <span className={cx(rowsCss.buildName, 't-body-sm muted')}>
            {w.name}
          </span>
        </a>
      ))}
      {build.plants.map((p) => (
        <a
          className={cx(chipsCss.buildChip, chipsCss.compact)}
          key={p.id}
          href={`#/calc/${p.id}`}
          title={t.rows.plantChip(p.name)}
        >
          <Icon name="factory" size={20} color="var(--accent-primary)" />
          <span className="t-num">×{plain(p.copies)}</span>
          <span className={cx(rowsCss.buildName, 't-body-sm muted')}>
            {p.name}
          </span>
        </a>
      ))}
    </div>
  );
};

/** Materials to build every building of the plan, workshops included. */
const BuildCost = ({ cost }: { cost: Map<string, number> }) => {
  if (cost.size === 0) return null;
  const entries = [...cost].sort(([, a], [, b]) => b - a);
  return (
    <div className="stack">
      <span className="t-label muted">{t.rows.buildCost}</span>
      <div className={chipsCss.balance}>
        {entries.map(([item, amount]) => (
          <span className={chipsCss.buildChip} key={item}>
            <GameIcon id={item} />
            <span className="stack" style={{ gap: 0 }}>
              <span className="t-num">{plain(amount)}</span>
              <span className="t-body-sm muted">{itemName(item)}</span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
};
