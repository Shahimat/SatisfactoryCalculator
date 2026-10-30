import { useEffect, useState } from 'react';

import {
  groupsForTarget,
  type Purity,
  type Goal,
  type Row,
} from '../../../engine/src/calc';
import {
  buildings,
  catalog,
  isFluid,
  itemName,
  items,
  DEFAULT_ITEM,
  POWER_SHARD_ICON,
  SOMERSLOOP_ICON,
  producibleItems,
  recipesByOutput,
} from '../catalog';
import { asPlan, evaluate, splitFlows } from '../calc';
import { newId } from '../model';
import { useAppState } from '../store';
import { FactoryChip, FlowChip, PowerChip } from './chips';
import { GroupsEditor, PurityField } from './edit-row';
import { Icon } from './icons';
import { Button, Field, GameIcon, Modal, NumberInput, Select } from './ui';
import { cx } from '../cx';
import uiCss from './ui.module.css';

type Mode = 'recipe' | 'extractor' | 'generator';

const MODES: { value: Mode; label: string }[] = [
  { value: 'recipe', label: 'Рецепт' },
  { value: 'extractor', label: 'Добыча' },
  { value: 'generator', label: 'Генератор' },
];

export const AddRowModal = ({
  initialItem,
  initialRate,
  onClose,
  onAdd,
}: {
  initialItem?: string;
  initialRate?: number;
  onClose: () => void;
  /** `goal`: what the recipe tab was asked to produce. */
  onAdd: (row: Row, goal?: Goal) => void;
}) => {
  // Raw resources are usually mined, even when a converter recipe exists.
  const [mode, setMode] = useState<Mode>(
    initialItem &&
      (items.get(initialItem)?.kind === 'resource' ||
        !recipesByOutput.has(initialItem)) &&
      extractorFor(initialItem)
      ? 'extractor'
      : 'recipe',
  );
  const [row, setRow] = useState<Row | null>(null);
  const [target, setTarget] = useState<Goal | undefined>();
  return (
    <Modal
      title="Добавить в расчёт"
      width={900}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            icon="plus"
            disabled={!row}
            onClick={() => row && onAdd(row, target)}
          >
            Добавить в расчёт
          </Button>
        </>
      }
    >
      <div className={uiCss.segmented} style={{ alignSelf: 'flex-start' }}>
        {MODES.map((m) => (
          <button
            key={m.value}
            type="button"
            className={m.value === mode ? uiCss.active : undefined}
            onClick={() => {
              setMode(m.value);
              setRow(null);
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
      {mode === 'recipe' && (
        <RecipeForm
          initialItem={initialItem}
          initialRate={initialRate}
          onRow={(r, t) => {
            setRow(r);
            setTarget(t);
          }}
        />
      )}
      {mode === 'extractor' && (
        <ExtractorForm
          initialResource={initialItem}
          initialRate={initialRate}
          onRow={(r) => {
            setRow(r);
            setTarget(undefined);
          }}
        />
      )}
      {mode === 'generator' && (
        <GeneratorForm
          onRow={(r) => {
            setRow(r);
            setTarget(undefined);
          }}
        />
      )}
      {row && <Preview row={row} />}
    </Modal>
  );
};

/** Reports the form's row to the parent whenever its content changes. */
const useReport = (
  row: Row | null,
  report: (row: Row | null) => void,
): void => {
  const key = JSON.stringify(row);
  useEffect(() => {
    report(row);
    // The row is rebuilt every render; its serialized content is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
};

const Preview = ({ row }: { row: Row }) => {
  const state = useAppState();
  const result = evaluate(asPlan([row]), state).rows[0];
  if (!result) return null;
  if (result.error)
    return <span className={uiCss.errorText}>{result.error}</span>;
  const { inputs, outputs } = splitFlows(result.flows.items);
  const building =
    row.kind === 'recipe'
      ? (catalog.recipes.find((r) => r.id === row.recipe)?.building ?? '')
      : 'building' in row
        ? row.building
        : '';
  return (
    <div
      className={uiCss.listItem}
      style={{ background: 'var(--bg-chrome)', flexWrap: 'wrap' }}
    >
      <span className="t-label muted">Итог</span>
      {'groups' in row && (
        <FactoryChip building={building} groups={row.groups} />
      )}
      <div className={uiCss.flows}>
        {inputs.map(([item, v]) => (
          <FlowChip key={item} item={item} perMinute={v} units={state.units} />
        ))}
      </div>
      <Icon name="arrowRight" size={20} color="var(--text-muted)" />
      <div className={uiCss.flows}>
        {outputs.map(([item, v]) => (
          <FlowChip key={item} item={item} perMinute={v} units={state.units} />
        ))}
      </div>
      <PowerChip powerMW={result.flows.powerMW} />
    </div>
  );
};

const RecipeForm = ({
  initialItem,
  initialRate,
  onRow,
}: {
  initialItem?: string;
  initialRate?: number;
  onRow: (row: Row | null, goal?: Goal) => void;
}) => {
  const [item, setItem] = useState(initialItem ?? DEFAULT_ITEM);
  const [rate, setRate] = useState(initialRate ?? 60);
  const [clock, setClock] = useState(100);
  const [amplified, setAmplified] = useState(0);
  const options = recipesByOutput.get(item) ?? [];
  const [recipeId, setRecipeId] = useState(options[0]?.id ?? '');
  const recipe = options.find((r) => r.id === recipeId) ?? options[0];
  const building = recipe ? buildings.get(recipe.building) : undefined;
  const slots = building?.somersloopSlots ?? 0;

  const valid =
    recipe &&
    building &&
    rate > 0 &&
    clock >= 1 &&
    clock <= building.maxClock * 100 &&
    amplified >= 0;
  const rowId = useState(newId)[0];
  const row: Row | null = valid
    ? {
        kind: 'recipe',
        id: rowId,
        recipe: recipe.id,
        groups: groupsForTarget(
          recipe,
          building,
          item,
          rate,
          clock / 100,
          amplified,
          slots,
        ),
      }
    : null;
  useReport(row, (r) => onRow(r, { item, perMinute: rate }));

  return (
    <>
      <div className="hstack" style={{ alignItems: 'flex-end' }}>
        <Field label="Что производим">
          <Select
            value={item}
            options={producibleItems.map((i) => ({
              value: i.id,
              label: i.name.ru,
              icon: <GameIcon id={i.id} size="sm" />,
            }))}
            onChange={(value) => {
              setItem(value);
              setRecipeId(recipesByOutput.get(value)?.[0]?.id ?? '');
            }}
          />
        </Field>
        <Field
          label="Сколько нужно"
          icon={<GameIcon id={item} size="sm" />}
          width={160}
        >
          <NumberInput
            value={rate}
            min={0}
            suffix={isFluid(item) ? 'м³/мин' : 'шт/мин'}
            onChange={setRate}
          />
        </Field>
        <Field
          label="Разгон"
          icon={<GameIcon id={POWER_SHARD_ICON} size="sm" />}
          width={110}
        >
          <NumberInput
            value={clock}
            min={1}
            max={250}
            suffix="%"
            onChange={setClock}
          />
        </Field>
        <Field
          label={slots > 0 ? `Петлевики · ${slots}/зд.` : 'Петлевики'}
          icon={<GameIcon id={SOMERSLOOP_ICON} size="sm" />}
          width={150}
        >
          <NumberInput
            value={slots > 0 ? amplified : 0}
            min={0}
            suffix="зд."
            onChange={(value) => setAmplified(slots > 0 ? value : 0)}
          />
        </Field>
      </div>
      <span className="t-label muted">Рецепты · на 1 здание при 100%</span>
      <div className="stack">
        {options.map((option) => {
          const optionBuilding = buildings.get(option.building);
          const perMinute = 60 / option.cycleSeconds;
          return (
            <button
              key={option.id}
              type="button"
              className={cx(
                uiCss.option,
                option.id === recipe?.id && uiCss.active,
              )}
              onClick={() => setRecipeId(option.id)}
            >
              <span className="stack" style={{ width: 240, gap: 4 }}>
                <span className="hstack">
                  <span className="t-title">{option.name.ru}</span>
                  {option.alternate && (
                    <span className={cx(uiCss.badge, uiCss.alt)}>ALT</span>
                  )}
                </span>
                <span className="hstack t-body-sm muted">
                  <GameIcon id={option.building} size="sm" />
                  {optionBuilding?.name.ru} ·{' '}
                  {optionBuilding?.powerMW || 'перем.'} МВт
                </span>
              </span>
              <span className={uiCss.flows}>
                {option.inputs.map(({ item: i, amount }) => (
                  <FlowChip
                    key={i}
                    item={i}
                    perMinute={-amount * perMinute}
                    units="ipm"
                  />
                ))}
              </span>
              <Icon name="arrowRight" size={18} color="var(--text-muted)" />
              <span className={uiCss.flows}>
                {option.outputs.map(({ item: i, amount }) => (
                  <FlowChip
                    key={i}
                    item={i}
                    perMinute={amount * perMinute}
                    units="ipm"
                  />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};

const extractors = catalog.buildings.filter((b) => b.extraction);
const generators = catalog.buildings.filter(
  (b) => b.generation && b.generation.fuels.length > 0,
);
const resources = catalog.items.filter((i) => i.kind === 'resource');

/** Extractor that can mine the resource; plain miners come before wells. */
const extractorFor = (resource: string) => {
  const item = items.get(resource);
  return extractors.find((b) =>
    b.extraction?.resources.length
      ? b.extraction.resources.includes(resource)
      : item && b.extraction?.forms.includes(item.form),
  );
};

const ExtractorForm = ({
  initialResource,
  initialRate,
  onRow,
}: {
  initialResource?: string;
  initialRate?: number;
  onRow: (row: Row | null) => void;
}) => {
  const initialBuilding =
    (initialResource && extractorFor(initialResource)) || extractors[0];
  const [building, setBuilding] = useState(initialBuilding?.id ?? '');
  const spec = buildings.get(building);
  const allowed = resources.filter((r) =>
    spec?.extraction?.resources.length
      ? spec.extraction.resources.includes(r.id)
      : spec?.extraction?.forms.includes(r.form),
  );
  const [resource, setResource] = useState(
    initialResource ?? allowed[0]?.id ?? '',
  );
  const [purity, setPurity] = useState<Purity>('normal');
  const [groups, setGroups] = useState(() => {
    const extraction = initialBuilding?.extraction;
    const perBuilding = extraction
      ? (extraction.amountPerCycle * 60) / extraction.cycleSeconds
      : 0;
    const count =
      initialRate && perBuilding > 0
        ? Math.round((initialRate / perBuilding) * 1000) / 1000
        : 1;
    return [{ count, clock: 1, somersloops: 0 }];
  });
  const rowId = useState(newId)[0];
  const current = allowed.some((r) => r.id === resource)
    ? resource
    : (allowed[0]?.id ?? '');
  const row: Row = {
    kind: 'extractor',
    id: rowId,
    building,
    resource: current,
    purity,
    groups,
  };
  useReport(current ? row : null, onRow);
  return (
    <>
      <div className="hstack" style={{ alignItems: 'flex-end' }}>
        <Field label="Здание">
          <Select
            value={building}
            options={extractors.map((b) => ({
              value: b.id,
              label: b.name.ru,
              icon: <GameIcon id={b.id} size="sm" />,
            }))}
            onChange={setBuilding}
          />
        </Field>
        <Field label="Ресурс">
          <Select
            value={current}
            options={allowed.map((r) => ({
              value: r.id,
              label: r.name.ru,
              icon: <GameIcon id={r.id} size="sm" />,
            }))}
            onChange={setResource}
          />
        </Field>
        <PurityField value={purity} onChange={setPurity} />
      </div>
      <GroupsEditor building={building} groups={groups} onChange={setGroups} />
    </>
  );
};

const GeneratorForm = ({ onRow }: { onRow: (row: Row | null) => void }) => {
  const [building, setBuilding] = useState(generators[0]?.id ?? '');
  const spec = buildings.get(building);
  const fuels = (spec?.generation?.fuels ?? []).filter((f) =>
    items.has(f.item),
  );
  const [fuel, setFuel] = useState(fuels[0]?.item ?? '');
  const [groups, setGroups] = useState([
    { count: 1, clock: 1, somersloops: 0 },
  ]);
  const rowId = useState(newId)[0];
  const current = fuels.some((f) => f.item === fuel)
    ? fuel
    : (fuels[0]?.item ?? '');
  const row: Row = {
    kind: 'generator',
    id: rowId,
    building,
    fuel: current,
    groups,
  };
  useReport(current ? row : null, onRow);
  return (
    <>
      <div className="hstack" style={{ alignItems: 'flex-end' }}>
        <Field label="Генератор">
          <Select
            value={building}
            options={generators.map((b) => ({
              value: b.id,
              label: b.name.ru,
              icon: <GameIcon id={b.id} size="sm" />,
              hint: `+${b.generation?.powerMW || '…'} МВт`,
            }))}
            onChange={setBuilding}
          />
        </Field>
        <Field label="Топливо">
          <Select
            value={current}
            options={fuels.map((f) => ({
              value: f.item,
              label: itemName(f.item),
              icon: <GameIcon id={f.item} size="sm" />,
            }))}
            onChange={setFuel}
          />
        </Field>
      </div>
      <GroupsEditor building={building} groups={groups} onChange={setGroups} />
    </>
  );
};
