import { useState } from 'react';

import type { CatalogBuilding, CatalogItem } from '../catalog';
import { buildingName, catalog, recipesByOutput } from '../catalog';
import { countLabel, plain } from '../calc';
import { FlowChip } from '../components/chips';
import { Icon } from '../components/icons';
import { GameIcon } from '../components/ui';
import { cx } from '../cx';
import layoutCss from './layout.module.css';
import uiCss from '../components/ui.module.css';
import { compareNames, formatDate, localName, type Messages, t } from '../i18n';

type Tab = 'recipes' | 'buildings' | 'items';

const TABS: Tab[] = ['recipes', 'buildings', 'items'];

const matches = (query: string, ...texts: string[]) =>
  query === '' ||
  texts.some((text) => text.toLowerCase().includes(query.toLowerCase()));

export const ReferenceScreen = ({ tab = 'recipes' }: { tab?: string }) => {
  const active = TABS.find((value) => value === tab) ?? 'recipes';
  const [query, setQuery] = useState('');
  return (
    <main className={layoutCss.content}>
      <div className={layoutCss.pageHeader}>
        <div className={layoutCss.heading}>
          <h1 className="t-display">{t.nav.reference}</h1>
          <span className="secondary">{t.reference.lead}</span>
        </div>
        <span className={uiCss.listItem}>
          <Icon name="check" size={14} color="var(--status-surplus)" />
          <span className="t-label secondary">
            {t.reference.game(catalog.game.version, catalog.game.build)}
          </span>
          <span className="t-num-sm muted">
            {t.reference.builtOn(
              formatDate(new Date(`${__BUILD_DATE__}T00:00`)),
            )}
          </span>
        </span>
      </div>
      <nav className={layoutCss.tabs}>
        {TABS.map((value) => (
          <a
            key={value}
            href={`#/reference/${value}`}
            className={value === active ? layoutCss.active : undefined}
          >
            {t.reference.tabs[value]}
          </a>
        ))}
      </nav>
      <div className={uiCss.input} style={{ maxWidth: 360 }}>
        <Icon name="search" size={16} color="var(--text-muted)" />
        <input
          placeholder={t.select.search}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </div>
      {active === 'recipes' && <RecipesTable query={query} />}
      {active === 'buildings' && <BuildingsTable query={query} />}
      {active === 'items' && <ItemsGrid query={query} />}
    </main>
  );
};

const RecipesTable = ({ query }: { query: string }) => {
  const [alt, setAlt] = useState<'all' | 'standard' | 'alt'>('all');
  const list = catalog.recipes
    .filter((r) =>
      alt === 'all' ? true : alt === 'alt' ? r.alternate : !r.alternate,
    )
    .filter((r) =>
      matches(query, r.name.ru, r.name.en, buildingName(r.building)),
    )
    .sort(compareNames);
  return (
    <>
      <div className="hstack">
        {(['all', 'standard', 'alt'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={cx(
              layoutCss.chipFilter,
              alt === value && layoutCss.active,
            )}
            onClick={() => setAlt(value)}
          >
            {t.reference.recipeFilters[value]}
          </button>
        ))}
        <span className="t-body-sm muted">
          {t.reference.count(list.length)}
        </span>
      </div>
      <table className={layoutCss.table}>
        <thead>
          <tr className="t-label">
            <th>{t.reference.columns.recipe}</th>
            <th>{t.reference.columns.building}</th>
            <th>{t.reference.columns.input}</th>
            <th>{t.reference.columns.output}</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => {
            const perMinute = 60 / r.cycleSeconds;
            return (
              <tr key={r.id}>
                <td>
                  <span className="hstack">
                    {localName(r)}
                    {r.alternate && (
                      <span className={cx(uiCss.badge, uiCss.alt)}>ALT</span>
                    )}
                  </span>
                </td>
                <td>
                  <span className="hstack">
                    <GameIcon id={r.building} size="sm" />
                    {buildingName(r.building)}
                  </span>
                </td>
                <td>
                  <div className={uiCss.flows}>
                    {r.inputs.map(({ item, amount }) => (
                      <FlowChip
                        key={item}
                        item={item}
                        perMinute={-amount * perMinute}
                        units="ipm"
                      />
                    ))}
                  </div>
                </td>
                <td>
                  <div className={uiCss.flows}>
                    {r.outputs.map(({ item, amount }) => (
                      <FlowChip
                        key={item}
                        item={item}
                        perMinute={amount * perMinute}
                        units="ipm"
                      />
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
};

const buildingPower = (b: CatalogBuilding): string => {
  if (b.generation)
    return b.generation.powerMW > 0
      ? `+${plain(b.generation.powerMW)}`
      : t.reference.byNode;
  if (b.variablePowerMW)
    return `−${b.variablePowerMW.min}…${b.variablePowerMW.max}`;
  return b.powerMW > 0 ? `−${plain(b.powerMW)}` : '—';
};

const BuildingsTable = ({ query }: { query: string }) => {
  const list = catalog.buildings
    .filter((b) => matches(query, b.name.ru, b.name.en))
    .sort((a, b) => a.kind.localeCompare(b.kind) || compareNames(a, b));
  return (
    <table className={layoutCss.table}>
      <thead>
        <tr className="t-label">
          <th>{t.reference.columns.building}</th>
          <th>{t.reference.columns.kind}</th>
          <th>{t.reference.columns.power}</th>
          <th>{t.reference.columns.clock}</th>
          <th>{t.reference.columns.somersloops}</th>
          <th>{t.reference.columns.recipes}</th>
        </tr>
      </thead>
      <tbody>
        {list.map((b) => (
          <tr key={b.id}>
            <td>
              <span className="hstack">
                <GameIcon id={b.id} />
                {localName(b)}
              </span>
            </td>
            <td>
              <span
                className={cx(
                  uiCss.badge,
                  b.kind === 'generator' && uiCss.ok,
                  b.kind === 'extractor' && uiCss.warn,
                )}
              >
                {t.reference.kinds[b.kind]}
              </span>
            </td>
            <td
              className="t-num"
              style={{
                color: b.generation ? 'var(--flow-out)' : 'var(--flow-in)',
              }}
            >
              {buildingPower(b)}
            </td>
            <td className="t-num">
              {t.reference.upTo(plain(b.maxClock * 100))}
            </td>
            <td className="t-num">
              {b.somersloopSlots > 0 ? b.somersloopSlots : '—'}
            </td>
            <td className="t-num">
              {catalog.recipes.filter((r) => r.building === b.id).length || '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

type ItemFilter = keyof Messages['reference']['itemFilters'];

const ITEM_FILTERS: { value: ItemFilter; test: (i: CatalogItem) => boolean }[] =
  [
    { value: 'all', test: () => true },
    { value: 'resource', test: (i) => i.kind === 'resource' },
    { value: 'part', test: (i) => i.kind === 'part' && i.form === 'solid' },
    { value: 'fluid', test: (i) => i.form !== 'solid' },
    { value: 'fuel', test: (i) => i.energyMJ > 0 },
  ];

const ItemsGrid = ({ query }: { query: string }) => {
  const [filter, setFilter] = useState<ItemFilter>('all');
  const test =
    ITEM_FILTERS.find((f) => f.value === filter)?.test ?? (() => true);
  const list = catalog.items
    .filter(test)
    .filter((i) => matches(query, i.name.ru, i.name.en))
    .sort(compareNames);
  return (
    <>
      <div className="hstack">
        {ITEM_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={cx(
              layoutCss.chipFilter,
              filter === f.value && layoutCss.active,
            )}
            onClick={() => setFilter(f.value)}
          >
            {t.reference.itemFilters[f.value]}
          </button>
        ))}
        <span className="t-body-sm muted">
          {t.reference.count(list.length)}
        </span>
      </div>
      <div
        className={layoutCss.cards}
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
      >
        {list.map((i) => (
          <div className={layoutCss.card} key={i.id}>
            <span className="hstack">
              <GameIcon id={i.id} size="lg" />
              <span className="spacer" />
              <span
                className={cx(uiCss.badge, i.form !== 'solid' && uiCss.fluid)}
              >
                {i.form === 'solid' ? t.reference.pieces : t.reference.cubic}
              </span>
            </span>
            <span className="t-title">{localName(i)}</span>
            <span className="t-body-sm muted">
              {countLabel(
                recipesByOutput.get(i.id)?.length ?? 0,
                t.count.recipes,
              )}
              {i.energyMJ > 0
                ? ` · ${t.reference.energy(plain(i.energyMJ))}`
                : ''}
              {i.sinkPoints > 0 ? ` · ${t.reference.points(i.sinkPoints)}` : ''}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
