import { useState } from 'react';

import {
  type BuildingGroup,
  type Purity,
  type Row,
  type SolverMode,
} from '../engine';
import {
  buildings,
  buildingName,
  isFluid,
  itemName,
  POWER_SHARD_ICON,
  recipes,
  SOMERSLOOP_ICON,
} from '../catalog';
import { copiesLabel, plain } from '../calc';
import { useAppState } from '../store';
import { FlowChip } from './chips';
import { Icon } from './icons';
import {
  Button,
  Field,
  GameIcon,
  IconButton,
  Modal,
  NumberInput,
  Select,
} from './ui';
import { cx } from '../cx';
import uiCss from './ui.module.css';
import { localName, t } from '../i18n';

const MAX_CLOCK_PERCENT = 250;

export const GroupsEditor = ({
  building,
  groups,
  onChange,
  boosted = false,
}: {
  building: string;
  groups: BuildingGroup[];
  onChange: (groups: BuildingGroup[]) => void;
  /** Only the Somersloop buildings of a row the solver sizes; there may be none. */
  boosted?: boolean;
}) => {
  const spec = buildings.get(building);
  const slots = spec?.somersloopSlots ?? 0;
  const maxClock = (spec?.maxClock ?? 2.5) * 100;
  const update = (index: number, patch: Partial<BuildingGroup>) =>
    onChange(groups.map((g, i) => (i === index ? { ...g, ...patch } : g)));
  return (
    <div className="stack">
      <span className="t-label muted">
        {boosted ? t.editRow.boostedGroups : t.editRow.groups}
      </span>
      {groups.map((group, index) => (
        <div className="hstack" key={index} style={{ alignItems: 'flex-end' }}>
          <Field
            label={t.editRow.count}
            icon={<GameIcon id={building} size="sm" />}
            width={140}
          >
            <NumberInput
              value={group.count}
              min={0}
              step={1}
              onChange={(count) => update(index, { count })}
            />
          </Field>
          <Field
            label={t.addRow.clock}
            icon={<GameIcon id={POWER_SHARD_ICON} size="sm" />}
            width={140}
          >
            <NumberInput
              value={Math.round(group.clock * 10000) / 100}
              min={1}
              max={Math.min(maxClock, MAX_CLOCK_PERCENT)}
              suffix="%"
              onChange={(percent) => update(index, { clock: percent / 100 })}
            />
          </Field>
          {slots > 0 && (
            <Field
              label={t.editRow.somersloopSlots(slots)}
              icon={<GameIcon id={SOMERSLOOP_ICON} size="sm" />}
              width={180}
            >
              <Select
                value={String(group.somersloops)}
                options={Array.from({ length: slots + 1 }, (_, n) => ({
                  value: String(n),
                  label: n === 0 ? t.workshops.none : `${n}/${slots}`,
                  icon:
                    n === 0 ? undefined : (
                      <GameIcon id={SOMERSLOOP_ICON} size="sm" />
                    ),
                  hint:
                    n === 0
                      ? undefined
                      : t.editRow.outputBoost(plain(1 + n / slots)),
                }))}
                onChange={(value) =>
                  update(index, { somersloops: Number(value) })
                }
              />
            </Field>
          )}
          {(boosted || groups.length > 1) && (
            <IconButton
              icon="trash"
              title={t.editRow.removeGroup}
              onClick={() => onChange(groups.filter((_, i) => i !== index))}
            />
          )}
        </div>
      ))}
      <div>
        <Button
          variant="ghost"
          icon="plus"
          onClick={() =>
            onChange([...groups, { count: 1, clock: 1, somersloops: slots }])
          }
        >
          {boosted ? t.editRow.addBoosted : t.editRow.addGroup}
        </Button>
      </div>
      {!boosted && groups.length === 1 && (
        <span className="t-body-sm muted">{t.editRow.groupHint}</span>
      )}
    </div>
  );
};

const PURITIES: Purity[] = ['impure', 'normal', 'pure'];

export const PurityField = ({
  value,
  onChange,
}: {
  value: Purity;
  onChange: (value: Purity) => void;
}) => (
  <Field label={t.editRow.node} width={180}>
    <Select
      value={value}
      options={PURITIES.map((p) => ({
        value: p,
        label: t.editRow.purityOptions[p],
      }))}
      onChange={onChange}
    />
  </Field>
);

const isValid = (row: Row): boolean =>
  'groups' in row
    ? row.groups.length > 0 &&
      row.groups.every(
        (g) =>
          Number.isFinite(g.count) &&
          g.count >= 0 &&
          g.clock >= 0.01 &&
          g.clock <= 2.5,
      )
    : Number.isFinite(row.copies) && row.copies >= 0;

export const EditRowModal = ({
  row,
  solved,
  auto,
  solver,
  onClose,
  onSave,
}: {
  /** The row as entered. */
  row: Row;
  /** The same row with the building counts the solver chose. */
  solved: Row;
  /** Whether the solver currently chooses the row's building count. */
  auto: boolean;
  solver: SolverMode;
  onClose: () => void;
  onSave: (row: Row) => void;
}) => {
  const [draft, setDraft] = useState<Row>(row);
  const sizable = draft.kind === 'recipe' || draft.kind === 'extractor';
  const locked = sizable ? draft.output : undefined;
  const autoNow =
    sizable && !locked && (draft.sizing ? draft.sizing === 'auto' : auto);
  // Rows sized by the solver: by goals (auto) or by a locked output.
  const solverSized = sizable && (autoNow || Boolean(locked));
  const building =
    draft.kind === 'recipe'
      ? (recipes.get(draft.recipe)?.building ?? '')
      : 'building' in draft
        ? draft.building
        : '';
  const slots = buildings.get(building)?.somersloopSlots ?? 0;
  return (
    <Modal
      title={t.editRow.title}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>{t.common.cancel}</Button>
          <Button
            variant="primary"
            disabled={!isValid(draft)}
            onClick={() => onSave(draft)}
          >
            {t.common.save}
          </Button>
        </>
      }
    >
      <RowSummary row={draft} />
      {sizable && (
        <div className="stack">
          <span className="t-label muted">{t.editRow.volume}</span>
          <div className={uiCss.segmented} style={{ alignSelf: 'flex-start' }}>
            <button
              type="button"
              className={solverSized ? uiCss.active : undefined}
              onClick={() =>
                // Back to the default clock: the solver spreads it over whole buildings.
                setDraft({
                  ...draft,
                  output: undefined,
                  buildings: undefined,
                  sizing: 'auto',
                  groups: [
                    { count: 1, clock: 1, somersloops: 0 },
                    ...('groups' in draft ? draft.groups : []).filter(
                      (g) => g.somersloops > 0,
                    ),
                  ],
                } as Row)
              }
            >
              {t.editRow.auto}
            </button>
            <button
              type="button"
              className={solverSized ? undefined : uiCss.active}
              onClick={() =>
                // Fixing starts from what the solver built, not from the entered counts.
                setDraft({
                  ...draft,
                  output: undefined,
                  buildings: undefined,
                  sizing: 'fixed',
                  groups: 'groups' in solved ? solved.groups : draft.groups,
                } as Row)
              }
            >
              {t.editRow.fixBuildings}
            </button>
          </div>
          <span className="t-body-sm muted">
            {locked
              ? t.editRow.locked(
                  `${itemName(locked.item)} ${plain(locked.perMinute)} ${unitOf(locked.item)}`,
                )
              : !autoNow
                ? t.editRow.fixedHint
                : t.editRow.autoHint[solver]}
          </span>
        </div>
      )}
      {draft.kind === 'extractor' && (
        <PurityField
          value={draft.purity}
          onChange={(purity) => setDraft({ ...draft, purity })}
        />
      )}
      {solverSized && 'groups' in draft && 'groups' in solved ? (
        <>
          <PlainSizing
            building={building}
            pinned={draft.buildings}
            solved={solved.groups.find((g) => g.somersloops === 0)}
            onChange={(buildings) => setDraft({ ...draft, buildings } as Row)}
          />
          {slots > 0 && (
            <GroupsEditor
              boosted
              building={building}
              groups={draft.groups.filter((g) => g.somersloops > 0)}
              onChange={(boosted) =>
                setDraft({
                  ...draft,
                  groups: [
                    ...draft.groups.filter((g) => g.somersloops === 0),
                    ...boosted,
                  ],
                } as Row)
              }
            />
          )}
        </>
      ) : 'groups' in draft ? (
        <>
          <GroupsEditor
            building={building}
            groups={draft.groups}
            onChange={(groups) => setDraft({ ...draft, groups })}
          />
          <span className="t-body-sm muted">
            <Icon name="gauge" size={12} /> {t.editRow.fractionHint}
          </span>
        </>
      ) : (
        <CopiesSizing
          draft={draft}
          solved={solved}
          auto={auto}
          onChange={setDraft}
        />
      )}
    </Modal>
  );
};

/**
 * Buildings without Somersloops of a row the solver sizes. Empty count: whole
 * buildings evenly underclocked; a typed count stays and the clock follows.
 */
const PlainSizing = ({
  building,
  pinned,
  solved,
  onChange,
}: {
  building: string;
  pinned?: number;
  solved?: BuildingGroup;
  onChange: (buildings: number | undefined) => void;
}) => (
  <div className="stack">
    <span className="t-label muted">{t.rows.columns.buildings}</span>
    <div className="hstack" style={{ alignItems: 'flex-end' }}>
      <Field
        label={t.editRow.count}
        icon={<GameIcon id={building} size="sm" />}
        width={140}
      >
        <NumberInput
          value={pinned ?? Number.NaN}
          placeholder={solved ? plain(solved.count, 3) : t.chips.auto}
          min={1}
          step={1}
          onChange={(value) =>
            onChange(
              Number.isFinite(value) && value >= 1
                ? Math.round(value)
                : undefined,
            )
          }
        />
      </Field>
      <Field
        label={t.addRow.clock}
        icon={<GameIcon id={POWER_SHARD_ICON} size="sm" />}
        width={140}
      >
        <div className={cx(uiCss.input, uiCss.readonly)}>
          <span className="t-num">
            {solved ? `${plain(solved.clock * 100, 2)} %` : '—'}
          </span>
        </div>
      </Field>
    </div>
    <span className="t-body-sm muted">
      {pinned ? t.editRow.pinnedHint : t.editRow.emptyHint}{' '}
      {t.editRow.clockAfterSave}
    </span>
  </div>
);

const unitOf = (item: string) => (isFluid(item) ? t.units.fluid : t.units.ipm);

/** Which row is being edited: building, recipe and what one building does. */
const RowSummary = ({ row }: { row: Row }) => {
  const state = useAppState();
  if (row.kind === 'workshop' || row.kind === 'plant') {
    const name =
      row.kind === 'workshop'
        ? state.workshops.find((w) => w.id === row.workshop)?.name
        : state.calculations.find((c) => c.id === row.calculation)?.name;
    return (
      <div className={uiCss.listItem}>
        <Icon
          name={row.kind === 'workshop' ? 'chain' : 'factory'}
          size={28}
          color="var(--accent-primary)"
        />
        <span className={cx(uiCss.grow, 'stack')} style={{ gap: 2 }}>
          <span className="t-title">{name ?? '—'}</span>
          <span className="t-body-sm muted">
            {row.kind === 'workshop' ? t.plan.workshop : t.editRow.plantLink}
          </span>
        </span>
      </div>
    );
  }
  const recipe = row.kind === 'recipe' ? recipes.get(row.recipe) : undefined;
  const building = recipe?.building ?? ('building' in row ? row.building : '');
  const title =
    row.kind === 'recipe'
      ? recipe
        ? localName(recipe)
        : row.recipe
      : row.kind === 'extractor'
        ? itemName(row.resource)
        : buildingName(row.building);
  const perMinute = recipe ? 60 / recipe.cycleSeconds : 0;
  return (
    <div
      className={cx(uiCss.listItem, 'stack')}
      style={{ alignItems: 'stretch' }}
    >
      <span className="hstack" style={{ flexWrap: 'nowrap' }}>
        <GameIcon id={building} size="lg" />
        <span className={cx(uiCss.grow, 'stack')} style={{ gap: 2 }}>
          <span className="hstack" style={{ gap: 6 }}>
            <span className="t-title">{title}</span>
            {recipe?.alternate && (
              <span className={cx(uiCss.badge, uiCss.alt)}>ALT</span>
            )}
          </span>
          <span className="t-body-sm muted">
            {buildingName(building)}
            {row.kind === 'generator' && t.editRow.fuel(itemName(row.fuel))}
            {recipe && t.editRow.perBuilding}
          </span>
        </span>
      </span>
      {recipe && (
        <span className="hstack">
          {recipe.inputs.map(({ item, amount }) => (
            <FlowChip
              key={item}
              item={item}
              perMinute={-amount * perMinute}
              units="ipm"
            />
          ))}
          <Icon name="arrowRight" size={16} color="var(--text-muted)" />
          {recipe.outputs.map(({ item, amount }) => (
            <FlowChip
              key={item}
              item={item}
              perMinute={amount * perMinute}
              units="ipm"
            />
          ))}
        </span>
      )}
    </div>
  );
};

type CopiedRow = Extract<Row, { kind: 'workshop' | 'plant' }>;

/**
 * Copies of a workshop or plant: the solver picks whole copies, the last one
 * partly loaded, or the user fixes a whole number of them.
 */
const CopiesSizing = ({
  draft,
  solved,
  auto,
  onChange,
}: {
  draft: CopiedRow;
  solved: Row;
  auto: boolean;
  onChange: (row: Row) => void;
}) => {
  const autoNow = draft.sizing ? draft.sizing === 'auto' : auto;
  const solvedCopies = 'copies' in solved ? solved.copies : draft.copies;
  return (
    <div className="stack">
      <span className="t-label muted">{t.editRow.copies}</span>
      <div className={uiCss.segmented} style={{ alignSelf: 'flex-start' }}>
        <button
          type="button"
          className={autoNow ? uiCss.active : undefined}
          onClick={() => onChange({ ...draft, sizing: 'auto' })}
        >
          {t.editRow.auto}
        </button>
        <button
          type="button"
          className={autoNow ? undefined : uiCss.active}
          onClick={() =>
            // Fixing starts from the whole copies the solver placed.
            onChange({
              ...draft,
              sizing: 'fixed',
              copies: Math.max(1, Math.ceil(solvedCopies - 1e-9)),
            })
          }
        >
          {t.editRow.fixCopies}
        </button>
      </div>
      {autoNow ? (
        <span className="t-body-sm muted">
          {t.editRow.copiesHint[draft.kind](copiesLabel(solvedCopies))}
        </span>
      ) : (
        <Field label={t.editRow.copiesField[draft.kind]} width={200}>
          <NumberInput
            value={draft.copies}
            min={1}
            step={1}
            onChange={(copies) => onChange({ ...draft, copies })}
          />
        </Field>
      )}
    </div>
  );
};
