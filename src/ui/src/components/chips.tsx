import { type ReactNode, useRef, useState } from 'react';

import type { BalanceEntry, BuildingGroup } from '../../../engine/src/calc';
import { buildings, isFluid, itemName } from '../catalog';
import { flowValue, plain, signed } from '../calc';
import type { Units } from '../model';
import { Icon } from './icons';
import { GameIcon } from './ui';

export type PickItem = (item: string, perMinute: number) => void;

/** Amount typed straight into a chip: a number is set, an empty field clears it. */
export type AmountEdit = {
  /** What the chip marks: a row locked at this output or a plan goal. */
  mark?: 'lock' | 'goal';
  /** Value the field starts from, per minute. */
  initial: number;
  onCommit: (perMinute: number | undefined) => void;
  title: string;
  /** What an empty field means, shown as its placeholder. */
  empty: string;
};

/**
 * Inline field of an editable chip. A cleared field clears the amount on Enter
 * or on leaving the field; a number is applied on Enter; Escape cancels.
 */
const AmountField = ({
  item,
  edit,
  onDone,
}: {
  item: string;
  edit: AmountEdit;
  onDone: () => void;
}) => {
  const [text, setText] = useState(String(Number(plain(edit.initial, 3))));
  const finished = useRef(false);
  const finish = (commit?: () => void) => {
    if (finished.current) return;
    finished.current = true;
    commit?.();
    onDone();
  };
  const cleared = () => text.trim() === '';
  return (
    <span className="values">
      <input
        className="chip-input t-num"
        autoFocus
        inputMode="decimal"
        placeholder={edit.empty}
        value={text}
        onFocus={(event) => event.target.select()}
        onChange={(event) => setText(event.target.value)}
        onBlur={() =>
          finish(cleared() ? () => edit.onCommit(undefined) : undefined)
        }
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            event.stopPropagation();
            finish();
          } else if (event.key === 'Enter') {
            const value = Number(text.trim().replace(',', '.'));
            if (cleared()) finish(() => edit.onCommit(undefined));
            else if (Number.isFinite(value) && value >= 0)
              finish(() => edit.onCommit(value));
          }
        }}
      />
      <span className="unit">
        {isFluid(item) ? 'м³/мин' : 'шт/мин'} · Enter
      </span>
    </span>
  );
};

const MARK_TITLE = {
  lock: 'выход строки закреплён',
  goal: 'цель плана',
} as const;

export const FlowChip = ({
  item,
  perMinute,
  units,
  onPick,
  actionTitle = 'подобрать рецепт',
  edit,
}: {
  item: string;
  perMinute: number;
  units: Units;
  onPick?: PickItem;
  actionTitle?: string;
  /** Click types the amount into the chip instead of picking. */
  edit?: AmountEdit;
}) => {
  const [editing, setEditing] = useState(false);
  const { value, unit } = flowValue(item, perMinute, units);
  const direction = isFluid(item) ? 'fluid' : perMinute < 0 ? 'in' : 'out';
  const mark = edit?.mark && (
    <span className={`chip-mark ${edit.mark}`} title={MARK_TITLE[edit.mark]}>
      <Icon name={edit.mark === 'lock' ? 'lock' : 'target'} size={12} />
    </span>
  );
  const content = (
    <>
      <GameIcon id={item} />
      <span className="values">
        <span className="t-num">{value}</span>
        <span className="unit">{unit}</span>
      </span>
      {mark}
    </>
  );
  if (edit) {
    return editing ? (
      <span className={`flow-chip editing ${direction}`}>
        <GameIcon id={item} />
        <AmountField item={item} edit={edit} onDone={() => setEditing(false)} />
        {mark}
      </span>
    ) : (
      <button
        type="button"
        className={`flow-chip pickable ${direction} ${edit.mark ? 'marked' : ''}`}
        title={`${itemName(item)} — ${edit.title}`}
        onClick={() => setEditing(true)}
      >
        {content}
      </button>
    );
  }
  return onPick ? (
    <button
      type="button"
      className={`flow-chip pickable ${direction}`}
      title={`${itemName(item)} — ${actionTitle}`}
      onClick={() => onPick(item, Math.abs(perMinute))}
    >
      {content}
    </button>
  ) : (
    <span className={`flow-chip ${direction}`} title={itemName(item)}>
      {content}
    </span>
  );
};

export const PowerChip = ({ powerMW }: { powerMW: number }) => (
  <span className={`flow-chip ${powerMW > 0 ? 'power-out' : 'power-in'}`}>
    <Icon name="bolt" size={22} color="var(--flow-power)" />
    <span className="values">
      <span className="t-num">{signed(powerMW, 1)}</span>
      <span className="unit">МВт</span>
    </span>
  </span>
);

export const FactoryChip = ({
  building,
  groups,
  auto,
  fixed,
  title = 'Изменить здания',
  onClick,
}: {
  building: string;
  groups: BuildingGroup[];
  /** The solver chooses the plain building count. */
  auto?: boolean;
  /** Counts are locked: the solver does not resize the row. */
  fixed?: boolean;
  title?: string;
  onClick?: () => void;
}) => {
  const spec = buildings.get(building);
  const slots = spec?.somersloopSlots ?? 0;
  const single = groups.length === 1 && groups[0]!.somersloops === 0;
  return (
    <button
      type="button"
      className="factory-chip"
      onClick={onClick}
      title={title}
    >
      <GameIcon id={building} size="lg" />
      <span className="groups">
        {groups.map((group, index) => (
          <span className="group" key={index}>
            <span className={`count ${single ? '' : 'sm'}`}>
              ×{plain(group.count, 3)}
            </span>
            <span className={`tag ${group.clock === 1 ? '' : 'warn'}`}>
              {single && <Icon name="gauge" size={12} />}
              {plain(group.clock * 100, 2)}%
            </span>
            {group.somersloops > 0 && (
              <span className="tag amplify">
                <Icon name="somersloop" size={12} />
                {group.somersloops}/{slots}
              </span>
            )}
          </span>
        ))}
        <span className="hstack" style={{ gap: 6 }}>
          <span className="t-body-sm muted">{spec?.name.ru ?? building}</span>
          {auto && (
            <span className="tag" title="Число зданий подбирает решатель">
              авто
            </span>
          )}
          {fixed && (
            <span
              className="tag fixed"
              title="Здания закреплены — пересчёт цепочки их не меняет"
            >
              <Icon name="lock" size={12} />
              закреплено
            </span>
          )}
        </span>
      </span>
    </button>
  );
};

const BALANCE_LABEL: Record<BalanceEntry['status'], string> = {
  target: 'Цель',
  surplus: 'Излишек',
  raw: 'Добыча',
  deficit: 'Дефицит',
};

const BALANCE_BADGE: Record<BalanceEntry['status'], string> = {
  target: 'accent',
  surplus: 'ok',
  raw: '',
  deficit: 'error',
};

export const BalanceChip = ({
  entry,
  units,
  onPick,
  edit,
}: {
  entry: BalanceEntry;
  units: Units;
  /** Consumed item: offer a recipe for it. */
  onPick?: PickItem;
  /** Produced item: type how much is needed on the output. */
  edit?: AmountEdit;
}) => {
  const [editing, setEditing] = useState(false);
  const { value, unit } = flowValue(entry.item, entry.perMinute, units);
  const produced = entry.perMinute >= 0;
  if (editing && edit) {
    return (
      <span className={`balance-chip editing ${entry.status}`}>
        <GameIcon id={entry.item} />
        <span className="stack" style={{ gap: 0 }}>
          <span className="t-body-sm">{itemName(entry.item)}</span>
          <AmountField
            item={entry.item}
            edit={edit}
            onDone={() => setEditing(false)}
          />
        </span>
      </span>
    );
  }
  return (
    <Clickable
      className={`balance-chip ${entry.status}`}
      title={produced ? (edit?.title ?? '') : 'Подобрать рецепт'}
      onClick={
        produced
          ? edit && (() => setEditing(true))
          : onPick && (() => onPick(entry.item, Math.abs(entry.perMinute)))
      }
    >
      <GameIcon id={entry.item} />
      <span className="stack" style={{ gap: 0 }}>
        <span className="t-body-sm">{itemName(entry.item)}</span>
        <span>
          <span className="t-num">{value}</span>{' '}
          <span className="t-num-sm muted">{unit}</span>
        </span>
      </span>
      <span className={`badge ${BALANCE_BADGE[entry.status]}`}>
        {BALANCE_LABEL[entry.status]}
      </span>
    </Clickable>
  );
};

const Clickable = ({
  className,
  title,
  onClick,
  children,
}: {
  className: string;
  title: string;
  onClick?: () => void;
  children: ReactNode;
}) =>
  onClick ? (
    <button
      type="button"
      className={`${className} pickable`}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  ) : (
    <span className={className}>{children}</span>
  );
