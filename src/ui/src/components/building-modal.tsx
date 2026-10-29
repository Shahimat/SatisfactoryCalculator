import { type Row, rowFlows } from '../../../engine/src/calc';
import {
  buildings,
  buildingName,
  itemName,
  recipes,
  SOMERSLOOP_ICON,
} from '../catalog';
import { calcContext, plain, type RowResult, splitFlows } from '../calc';
import { useAppState } from '../store';
import { FlowChip, PowerChip } from './chips';
import { Icon } from './icons';
import { GameIcon, Modal } from './ui';

const buildingOf = (row: Row): string =>
  row.kind === 'recipe'
    ? (recipes.get(row.recipe)?.building ?? '')
    : 'building' in row
      ? row.building
      : '';

/** What the buildings of a row do: per building and in total, and what they cost. */
export const BuildingModal = ({
  result,
  onClose,
}: {
  result: RowResult;
  onClose: () => void;
}) => {
  const ctx = calcContext(useAppState());
  const { row, flows } = result;
  if (!('groups' in row)) return null;
  const building = buildingOf(row);
  const spec = buildings.get(building);
  const slots = spec?.somersloopSlots ?? 0;
  const whole = row.groups.reduce((sum, g) => sum + Math.ceil(g.count), 0);
  const subtitle =
    row.kind === 'recipe'
      ? (recipes.get(row.recipe)?.name.ru ?? row.recipe)
      : row.kind === 'extractor'
        ? itemName(row.resource)
        : itemName(row.fuel);
  const total = splitFlows(flows.items);
  return (
    <Modal title="Здание" width={720} onClose={onClose}>
      <div className="list-item">
        <GameIcon id={building} size="lg" />
        <span className="grow stack" style={{ gap: 2 }}>
          <span className="t-title">{buildingName(building)}</span>
          <span className="t-body-sm muted">
            {subtitle} · построить {whole} · загрузка ×
            {plain(
              row.groups.reduce((sum, g) => sum + g.count, 0),
              3,
            )}
          </span>
        </span>
        {flows.powerMW !== 0 && <PowerChip powerMW={flows.powerMW} />}
      </div>

      <span className="t-label muted">Одно здание</span>
      {row.groups
        .filter((g) => g.count > 0)
        .map((group, index) => {
          const one = (() => {
            try {
              return rowFlows(
                { ...row, groups: [{ ...group, count: 1 }] },
                ctx,
              );
            } catch {
              return undefined;
            }
          })();
          if (!one) return null;
          const { inputs, outputs } = splitFlows(one.items);
          return (
            <div className="stack" key={index} style={{ gap: 6 }}>
              <span className="hstack t-body-sm muted" style={{ gap: 6 }}>
                <span className="t-num">×{plain(group.count, 3)}</span>
                <Icon name="gauge" size={12} />
                {plain(group.clock * 100)}%
                {group.somersloops > 0 && (
                  <>
                    <GameIcon id={SOMERSLOOP_ICON} size="sm" />
                    {group.somersloops}/{slots}
                  </>
                )}
              </span>
              <div className="flows">
                {inputs.map(([item, v]) => (
                  <FlowChip key={item} item={item} perMinute={v} units="ipm" />
                ))}
                <Icon name="arrowRight" size={20} color="var(--text-muted)" />
                {outputs.map(([item, v]) => (
                  <FlowChip key={item} item={item} perMinute={v} units="ipm" />
                ))}
                {one.powerMW !== 0 && <PowerChip powerMW={one.powerMW} />}
              </div>
            </div>
          );
        })}

      <span className="t-label muted">Вся строка</span>
      <div className="flows">
        {total.inputs.map(([item, v]) => (
          <FlowChip key={item} item={item} perMinute={v} units="ipm" />
        ))}
        <Icon name="arrowRight" size={20} color="var(--text-muted)" />
        {total.outputs.map(([item, v]) => (
          <FlowChip key={item} item={item} perMinute={v} units="ipm" />
        ))}
      </div>

      {spec?.buildCost && (
        <>
          <span className="t-label muted">
            Постройка · одно здание / все {whole}
          </span>
          <div className="balance">
            {spec.buildCost.map(({ item, amount }) => (
              <span className="build-chip" key={item}>
                <GameIcon id={item} />
                <span className="stack" style={{ gap: 0 }}>
                  <span className="t-num">
                    {plain(amount)} / {plain(amount * whole)}
                  </span>
                  <span className="t-body-sm muted">{itemName(item)}</span>
                </span>
              </span>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};
