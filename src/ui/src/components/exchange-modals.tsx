import { useState } from 'react';

import type { Row } from '../../../engine/src/calc';
import { catalog } from '../catalog';
import { countLabel, evaluate, migratePlan, splitFlows } from '../calc';
import {
  applyImport,
  buildExport,
  dependencies,
  type ExportFile,
  exportFileName,
  importEntries,
  type ImportMode,
  parseExport,
} from '../exchange';
import { newId, type Plan } from '../model';
import { getState, setState, useAppState } from '../store';
import { FlowChip } from './chips';
import { Icon } from './icons';
import { Button, Modal } from './ui';

export const ConnectModal = ({
  kind,
  excludeCalculation,
  excludeWorkshop,
  onClose,
  onAdd,
}: {
  kind: 'workshop' | 'plant';
  excludeCalculation?: string;
  excludeWorkshop?: string;
  onClose: () => void;
  onAdd: (row: Row) => void;
}) => {
  const state = useAppState();
  const options =
    kind === 'workshop'
      ? state.workshops.filter((w) => w.id !== excludeWorkshop)
      : state.calculations.filter((c) => c.id !== excludeCalculation);
  const [selected, setSelected] = useState(options[0]?.id ?? '');
  const title = kind === 'workshop' ? 'Подключить цех' : 'Подключить завод';
  return (
    <Modal
      title={title}
      width={720}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            disabled={!selected}
            onClick={() =>
              onAdd(
                kind === 'workshop'
                  ? {
                      kind: 'workshop',
                      id: newId(),
                      workshop: selected,
                      copies: 1,
                    }
                  : {
                      kind: 'plant',
                      id: newId(),
                      calculation: selected,
                      copies: 1,
                    },
              )
            }
          >
            Подключить
          </Button>
        </>
      }
    >
      {options.length === 0 ? (
        <span className="muted">
          {kind === 'workshop'
            ? 'Цехов пока нет — создайте цех в разделе «Цеха».'
            : 'Других расчётов нет — завод ссылается на другой расчёт.'}
        </span>
      ) : (
        <div className="stack">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`option ${option.id === selected ? 'active' : ''}`}
              onClick={() => setSelected(option.id)}
            >
              <Icon name={kind === 'workshop' ? 'chain' : 'factory'} />
              <span className="stack grow" style={{ gap: 6 }}>
                <span>{option.name}</span>
                <span className="t-body-sm muted">
                  {countLabel(option.rows.length, 'строка', 'строки', 'строк')}
                  {' · одна копия'}
                </span>
                <PlanFlows plan={option} />
              </span>
            </button>
          ))}
        </div>
      )}
      <span className="t-body-sm muted">
        Число копий подбирает решатель по целям и потреблению строк.
      </span>
    </Modal>
  );
};

/** What one copy of a workshop or plant takes in and puts out. */
const PlanFlows = ({ plan }: { plan: Plan }) => {
  const state = useAppState();
  const { inputs, outputs } = splitFlows(evaluate(plan, state).total.items);
  if (inputs.length === 0 && outputs.length === 0) return null;
  return (
    <span className="flows">
      {inputs.map(([item, v]) => (
        <FlowChip key={item} item={item} perMinute={v} units={state.units} />
      ))}
      <Icon name="arrowRight" size={16} color="var(--text-muted)" />
      {outputs.map(([item, v]) => (
        <FlowChip key={item} item={item} perMinute={v} units={state.units} />
      ))}
    </span>
  );
};

const download = (name: string, text: string) => {
  const url = URL.createObjectURL(
    new Blob([text], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

export const ExportModal = ({
  initial,
  onClose,
}: {
  initial?: { calculation?: string; workshop?: string };
  onClose: () => void;
}) => {
  const state = useAppState();
  const [calculations, setCalculations] = useState(
    new Set(initial?.calculation ? [initial.calculation] : []),
  );
  const [workshops, setWorkshops] = useState(
    new Set(initial?.workshop ? [initial.workshop] : []),
  );
  const selection = { calculations, workshops };
  const deps = dependencies(state, selection);
  const allSelected =
    state.calculations.every((c) => calculations.has(c.id)) &&
    state.workshops.every((w) => workshops.has(w.id));
  const now = new Date();
  const file = buildExport(state, selection, catalog.version, now);
  const toggle = (
    set: Set<string>,
    id: string,
    apply: (s: Set<string>) => void,
  ) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    apply(next);
  };
  const item = (
    id: string,
    name: string,
    meta: string,
    checked: boolean,
    neededBy: string | undefined,
    onToggle: () => void,
  ) => (
    <label className="list-item" key={id} style={{ cursor: 'pointer' }}>
      <input
        type="checkbox"
        className="checkbox"
        checked={checked || Boolean(neededBy)}
        disabled={Boolean(neededBy) && !checked}
        onChange={onToggle}
      />
      <span className="grow stack" style={{ gap: 2 }}>
        <span>{name}</span>
        <span className="t-body-sm muted">{meta}</span>
      </span>
      {neededBy && !checked && (
        <span className="tag">
          <Icon name="external" size={12} />
          нужен для «{neededBy}»
        </span>
      )}
    </label>
  );
  return (
    <Modal
      title="Экспорт"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            disabled={file.calculations.length + file.workshops.length === 0}
            onClick={() => {
              download(exportFileName(now), JSON.stringify(file, null, 2));
              onClose();
            }}
          >
            Скачать JSON
          </Button>
        </>
      }
    >
      <label className="hstack" style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          className="checkbox"
          checked={allSelected}
          onChange={() => {
            if (allSelected) {
              setCalculations(new Set());
              setWorkshops(new Set());
            } else {
              setCalculations(new Set(state.calculations.map((c) => c.id)));
              setWorkshops(new Set(state.workshops.map((w) => w.id)));
            }
          }}
        />
        Выбрать всё — полный бэкап
      </label>
      <div className="stack">
        <span className="t-label muted">Расчёты</span>
        {state.calculations.map((c) =>
          item(
            c.id,
            c.name,
            `${countLabel(c.rows.length, 'строка', 'строки', 'строк')}${c.built > 0 ? ` · построено ×${c.built}` : ''}`,
            calculations.has(c.id),
            deps.calculations.get(c.id),
            () => toggle(calculations, c.id, setCalculations),
          ),
        )}
      </div>
      <div className="stack">
        <span className="t-label muted">Цеха</span>
        {state.workshops.length === 0 && (
          <span className="muted t-body-sm">нет</span>
        )}
        {state.workshops.map((w) =>
          item(
            w.id,
            w.name,
            countLabel(w.rows.length, 'строка', 'строки', 'строк'),
            workshops.has(w.id),
            deps.workshops.get(w.id),
            () => toggle(workshops, w.id, setWorkshops),
          ),
        )}
      </div>
      <div
        className="list-item t-num-sm secondary"
        style={{ background: 'var(--bg-app)' }}
      >
        {exportFileName(now)} ·{' '}
        {countLabel(file.calculations.length, 'расчёт', 'расчёта', 'расчётов')},{' '}
        {countLabel(file.workshops.length, 'цех', 'цеха', 'цехов')} · игра{' '}
        {catalog.version}
      </div>
    </Modal>
  );
};

export const ImportModal = ({ onClose }: { onClose: () => void }) => {
  const state = useAppState();
  const [file, setFile] = useState<{ name: string; data: ExportFile } | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ImportMode>('copy');
  const entries = file ? importEntries(state, file.data) : [];
  const duplicates = entries.filter((e) => e.exists).length;
  const pick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.addEventListener('change', async () => {
      const chosen = input.files?.[0];
      if (!chosen) return;
      try {
        const data = parseExport(await chosen.text());
        setFile({
          name: chosen.name,
          data: {
            ...data,
            calculations: data.calculations.map(migratePlan),
            workshops: data.workshops.map(migratePlan),
          },
        });
        setError(null);
      } catch (error_) {
        setFile(null);
        setError((error_ as Error).message);
      }
    });
    input.click();
  };
  return (
    <Modal
      title="Импорт"
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Отмена</Button>
          <Button
            variant="primary"
            disabled={!file}
            onClick={() => {
              if (!file) return;
              setState(() => applyImport(getState(), file.data, mode));
              onClose();
            }}
          >
            Импортировать
          </Button>
        </>
      }
    >
      <div className="list-item" style={{ background: 'var(--bg-app)' }}>
        <Icon name="arrowDown" size={20} />
        <span className="grow stack" style={{ gap: 2 }}>
          <span className="t-num">{file?.name ?? 'Файл не выбран'}</span>
          {file && (
            <span className="t-body-sm muted">
              игра {file.data.gameVersion} · экспорт{' '}
              {new Date(file.data.exportedAt).toLocaleDateString('ru')} ·{' '}
              {countLabel(entries.length, 'объект', 'объекта', 'объектов')}
            </span>
          )}
        </span>
        <Button variant="ghost" onClick={pick}>
          {file ? 'Другой файл' : 'Выбрать файл'}
        </Button>
      </div>
      {error && <span className="error-text">{error}</span>}
      {file && file.data.gameVersion !== catalog.version && (
        <div className="banner">
          <Icon name="alert" color="var(--status-warning)" />
          <span className="t-body-sm">
            Файл собран на игре {file.data.gameVersion}, сайт — на{' '}
            {catalog.version}. После импорта расчёты пересчитаются по новым
            данным, изменённые и удалённые рецепты будут подсвечены.
          </span>
        </div>
      )}
      {file && (
        <div className="stack">
          <span className="t-label muted">Содержимое файла</span>
          {entries.map((entry) => (
            <div className="list-item" key={`${entry.kind}:${entry.id}`}>
              <Icon name={entry.kind === 'workshop' ? 'chain' : 'gauge'} />
              <span className="grow">
                {entry.kind === 'workshop' ? 'Цех' : 'Расчёт'} «{entry.name}»
              </span>
              <span className={`badge ${entry.exists ? 'warn' : 'ok'}`}>
                {entry.exists ? 'Уже есть' : 'Новый'}
              </span>
            </div>
          ))}
        </div>
      )}
      {duplicates > 0 && (
        <div className="stack">
          <span className="t-label muted">
            Совпадающие ({duplicates}) — одно решение на весь импорт
          </span>
          <button
            type="button"
            className={`option ${mode === 'copy' ? 'active' : ''}`}
            onClick={() => setMode('copy')}
          >
            <span className="stack" style={{ gap: 2 }}>
              <span>Добавить копией</span>
              <span className="t-body-sm muted">
                существующие не трогаем, у копий новый uuid и пометка «(импорт)»
              </span>
            </span>
          </button>
          <button
            type="button"
            className={`option ${mode === 'replace' ? 'active' : ''}`}
            onClick={() => setMode('replace')}
          >
            <span className="stack" style={{ gap: 2 }}>
              <span>Заменить существующие</span>
              <span className="t-body-sm muted">
                ваши версии будут перезаписаны версиями из файла
              </span>
            </span>
          </button>
        </div>
      )}
    </Modal>
  );
};
