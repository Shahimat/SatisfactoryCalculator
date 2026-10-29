import { useState } from 'react';

import type { CatalogBuilding, CatalogItem } from '../catalog';
import { buildingName, catalog, recipesByOutput } from '../catalog';
import { plain } from '../calc';
import { FlowChip } from '../components/chips';
import { Icon } from '../components/icons';
import { GameIcon } from '../components/ui';

type Tab = 'recipes' | 'buildings' | 'items';

const TABS: { value: Tab; label: string }[] = [
  { value: 'recipes', label: 'Рецепты' },
  { value: 'buildings', label: 'Здания' },
  { value: 'items', label: 'Предметы' },
];

const matches = (query: string, ...texts: string[]) =>
  query === '' ||
  texts.some((t) => t.toLowerCase().includes(query.toLowerCase()));

export const ReferenceScreen = ({ tab = 'recipes' }: { tab?: string }) => {
  const active = (TABS.find((t) => t.value === tab)?.value ?? 'recipes') as Tab;
  const [query, setQuery] = useState('');
  return (
    <main className="content">
      <div className="page-header">
        <div className="heading">
          <h1 className="t-display">Справочник</h1>
          <span className="secondary">
            Данные игры только для чтения — собираются из файлов игры при сборке
            сайта.
          </span>
        </div>
        <span className="list-item">
          <Icon name="check" size={14} color="var(--status-surplus)" />
          <span className="t-label secondary">
            Игра {catalog.game.version} · сборка {catalog.game.build}
          </span>
          <span className="t-num-sm muted">собрано {__BUILD_DATE__}</span>
        </span>
      </div>
      <nav className="tabs">
        {TABS.map((t) => (
          <a
            key={t.value}
            href={`#/reference/${t.value}`}
            className={t.value === active ? 'active' : ''}
          >
            {t.label}
          </a>
        ))}
      </nav>
      <div className="input" style={{ maxWidth: 360 }}>
        <Icon name="search" size={16} color="var(--text-muted)" />
        <input
          placeholder="Поиск"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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
    .sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'));
  return (
    <>
      <div className="hstack">
        {(['all', 'standard', 'alt'] as const).map((value) => (
          <button
            key={value}
            type="button"
            className={`chip-filter ${alt === value ? 'active' : ''}`}
            onClick={() => setAlt(value)}
          >
            {{ all: 'Все', standard: 'Стандартные', alt: 'ALT' }[value]}
          </button>
        ))}
        <span className="t-body-sm muted">{list.length} шт.</span>
      </div>
      <table className="table">
        <thead>
          <tr className="t-label">
            <th>Рецепт</th>
            <th>Здание</th>
            <th>Вход · в минуту на здание</th>
            <th>Выход</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => {
            const perMinute = 60 / r.cycleSeconds;
            return (
              <tr key={r.id}>
                <td>
                  <span className="hstack">
                    {r.name.ru}
                    {r.alternate && <span className="badge alt">ALT</span>}
                  </span>
                </td>
                <td>
                  <span className="hstack">
                    <GameIcon id={r.building} size="sm" />
                    {buildingName(r.building)}
                  </span>
                </td>
                <td>
                  <div className="flows">
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
                  <div className="flows">
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

const KIND_LABEL: Record<CatalogBuilding['kind'], string> = {
  manufacturer: 'Производство',
  extractor: 'Добыча',
  generator: 'Генерация',
  support: 'Вспомогательное',
};

const buildingPower = (b: CatalogBuilding): string => {
  if (b.generation)
    return b.generation.powerMW > 0
      ? `+${plain(b.generation.powerMW)}`
      : 'по узлу';
  if (b.variablePowerMW)
    return `−${b.variablePowerMW.min}…${b.variablePowerMW.max}`;
  return b.powerMW > 0 ? `−${plain(b.powerMW)}` : '—';
};

const BuildingsTable = ({ query }: { query: string }) => {
  const list = catalog.buildings
    .filter((b) => matches(query, b.name.ru, b.name.en))
    .sort(
      (a, b) =>
        a.kind.localeCompare(b.kind) ||
        a.name.ru.localeCompare(b.name.ru, 'ru'),
    );
  return (
    <table className="table">
      <thead>
        <tr className="t-label">
          <th>Здание</th>
          <th>Тип</th>
          <th>Энергия, МВт</th>
          <th>Разгон</th>
          <th>Петлевики</th>
          <th>Рецептов</th>
        </tr>
      </thead>
      <tbody>
        {list.map((b) => (
          <tr key={b.id}>
            <td>
              <span className="hstack">
                <GameIcon id={b.id} />
                {b.name.ru}
              </span>
            </td>
            <td>
              <span
                className={`badge ${b.kind === 'generator' ? 'ok' : b.kind === 'extractor' ? 'warn' : ''}`}
              >
                {KIND_LABEL[b.kind]}
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
            <td className="t-num">до {plain(b.maxClock * 100)}%</td>
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

const ITEM_FILTERS: {
  value: string;
  label: string;
  test: (i: CatalogItem) => boolean;
}[] = [
  { value: 'all', label: 'Все', test: () => true },
  { value: 'resource', label: 'Ресурсы', test: (i) => i.kind === 'resource' },
  {
    value: 'part',
    label: 'Компоненты',
    test: (i) => i.kind === 'part' && i.form === 'solid',
  },
  { value: 'fluid', label: 'Жидкости и газы', test: (i) => i.form !== 'solid' },
  { value: 'fuel', label: 'Топливо', test: (i) => i.energyMJ > 0 },
];

const ItemsGrid = ({ query }: { query: string }) => {
  const [filter, setFilter] = useState('all');
  const test =
    ITEM_FILTERS.find((f) => f.value === filter)?.test ?? (() => true);
  const list = catalog.items
    .filter(test)
    .filter((i) => matches(query, i.name.ru, i.name.en))
    .sort((a, b) => a.name.ru.localeCompare(b.name.ru, 'ru'));
  return (
    <>
      <div className="hstack">
        {ITEM_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`chip-filter ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
        <span className="t-body-sm muted">{list.length} шт.</span>
      </div>
      <div
        className="cards"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}
      >
        {list.map((i) => (
          <div className="card" key={i.id}>
            <span className="hstack">
              <GameIcon id={i.id} size="lg" />
              <span className="spacer" />
              <span className={`badge ${i.form === 'solid' ? '' : 'fluid'}`}>
                {i.form === 'solid' ? 'шт' : 'м³'}
              </span>
            </span>
            <span className="t-title">{i.name.ru}</span>
            <span className="t-body-sm muted">
              {recipesByOutput.get(i.id)?.length ?? 0} рецепт(ов)
              {i.energyMJ > 0 ? ` · ${plain(i.energyMJ)} МДж` : ''}
              {i.sinkPoints > 0 ? ` · ${i.sinkPoints} очк.` : ''}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
