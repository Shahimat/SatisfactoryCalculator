import { useState } from 'react';

import {
  type BuildingGroup,
  type Purity,
  type Row,
  type SolverMode,
} from '../../../engine/src/calc';
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
        {boosted ? 'Здания с петлевиками' : 'Группы зданий'}
      </span>
      {groups.map((group, index) => (
        <div className="hstack" key={index} style={{ alignItems: 'flex-end' }}>
          <Field
            label="Зданий"
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
            label="Разгон"
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
              label={`Петлевики · слотов ${slots}`}
              icon={<GameIcon id={SOMERSLOOP_ICON} size="sm" />}
              width={180}
            >
              <Select
                value={String(group.somersloops)}
                options={Array.from({ length: slots + 1 }, (_, n) => ({
                  value: String(n),
                  label: n === 0 ? 'нет' : `${n}/${slots}`,
                  icon:
                    n === 0 ? undefined : (
                      <GameIcon id={SOMERSLOOP_ICON} size="sm" />
                    ),
                  hint: n === 0 ? undefined : `×${plain(1 + n / slots)} выход`,
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
              title="Удалить группу"
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
          {boosted ? 'Группа с петлевиками' : 'Группа с другим разгоном'}
        </Button>
      </div>
      {!boosted && groups.length === 1 && (
        <span className="t-body-sm muted">
          Группа — часть зданий строки со своим разгоном и петлевиками, например
          8 зданий на 100 % и 2 разогнанных с петлевиками.
        </span>
      )}
    </div>
  );
};

const PURITY_OPTIONS: { value: Purity; label: string }[] = [
  { value: 'impure', label: 'Бедное ×0.5' },
  { value: 'normal', label: 'Обычное ×1' },
  { value: 'pure', label: 'Богатое ×2' },
];

export const PurityField = ({
  value,
  onChange,
}: {
  value: Purity;
  onChange: (value: Purity) => void;
}) => (
  <Field label="Узел" width={180}>
    <Select value={value} options={PURITY_OPTIONS} onChange={onChange} />
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
      title="Изменить строку"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            disabled={!isValid(draft)}
            onClick={() => onSave(draft)}
          >
            Сохранить
          </Button>
        </>
      }
    >
      <RowSummary row={draft} />
      {sizable && (
        <div className="stack">
          <span className="t-label muted">Объём</span>
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
              Авто
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
              Зафиксировать здания
            </button>
          </div>
          <span className="t-body-sm muted">
            {locked
              ? `Закреплён выход: ${itemName(locked.item)} ${plain(locked.perMinute)} ${unitOf(locked.item)} — меняется в чипе выхода строки.`
              : !autoNow
                ? 'Здания закреплены как заданы ниже, остальные строки подстраиваются под них.'
                : solver === 'sequential'
                  ? 'Строка покрывает цели и то, чего не хватает строкам выше.'
                  : 'Цели и потребности всех строк покрываются вместе, порядок строк не важен.'}
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
            <Icon name="gauge" size={12} /> Дробное число зданий — последнее
            работает с пониженным разгоном.
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
    <span className="t-label muted">Здания</span>
    <div className="hstack" style={{ alignItems: 'flex-end' }}>
      <Field
        label="Зданий"
        icon={<GameIcon id={building} size="sm" />}
        width={140}
      >
        <NumberInput
          value={pinned ?? Number.NaN}
          placeholder={solved ? plain(solved.count, 3) : 'авто'}
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
        label="Разгон"
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
      {pinned
        ? 'Число зданий задано — разгон подстраивается под нужный выход (до максимума здания). Очистите поле, чтобы вернуть подбор.'
        : 'Пусто — целые здания с ровным разгоном, без дробного последнего. Введите число — разгон подстроится под него.'}{' '}
      Разгон обновится после сохранения.
    </span>
  </div>
);

const unitOf = (item: string) => (isFluid(item) ? 'м³/мин' : 'шт/мин');

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
            {row.kind === 'workshop' ? 'Цех' : 'Завод — ссылка на расчёт'}
          </span>
        </span>
      </div>
    );
  }
  const recipe = row.kind === 'recipe' ? recipes.get(row.recipe) : undefined;
  const building = recipe?.building ?? ('building' in row ? row.building : '');
  const title =
    row.kind === 'recipe'
      ? (recipe?.name.ru ?? row.recipe)
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
            {row.kind === 'generator' && ` · топливо: ${itemName(row.fuel)}`}
            {recipe && ' · рецепт на 1 здание при 100%:'}
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
  const what = draft.kind === 'workshop' ? 'цеха' : 'завода';
  return (
    <div className="stack">
      <span className="t-label muted">Копии</span>
      <div className={uiCss.segmented} style={{ alignSelf: 'flex-start' }}>
        <button
          type="button"
          className={autoNow ? uiCss.active : undefined}
          onClick={() => onChange({ ...draft, sizing: 'auto' })}
        >
          Авто
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
          Зафиксировать копии
        </button>
      </div>
      {autoNow ? (
        <span className="t-body-sm muted">
          Решатель подбирает целые копии {what} по целям и потреблению строк;
          неполная последняя копия работает с пониженной загрузкой. Сейчас:{' '}
          {copiesLabel(solvedCopies)}.
        </span>
      ) : (
        <Field label={`Копий ${what}`} width={200}>
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
