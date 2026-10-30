import { useState } from 'react';

import type { Row } from '../engine';
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
import { cx } from '../cx';
import uiCss from './ui.module.css';
import { formatDate, t } from '../i18n';

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
  const title =
    kind === 'workshop' ? t.exchange.connectWorkshop : t.exchange.connectPlant;
  return (
    <Modal
      title={title}
      width={720}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>{t.common.cancel}</Button>
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
            {t.exchange.connect}
          </Button>
        </>
      }
    >
      {options.length === 0 ? (
        <span className="muted">
          {kind === 'workshop'
            ? t.exchange.noWorkshops
            : t.exchange.noCalculations}
        </span>
      ) : (
        <div className="stack">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              className={cx(
                uiCss.option,
                option.id === selected && uiCss.active,
              )}
              onClick={() => setSelected(option.id)}
            >
              <Icon name={kind === 'workshop' ? 'chain' : 'factory'} />
              <span className={cx(uiCss.grow, 'stack')} style={{ gap: 6 }}>
                <span>{option.name}</span>
                <span className="t-body-sm muted">
                  {countLabel(option.rows.length, t.count.rows)}
                  {t.exchange.oneCopy}
                </span>
                <PlanFlows plan={option} />
              </span>
            </button>
          ))}
        </div>
      )}
      <span className="t-body-sm muted">{t.exchange.copiesBySolver}</span>
    </Modal>
  );
};

/** What one copy of a workshop or plant takes in and puts out. */
const PlanFlows = ({ plan }: { plan: Plan }) => {
  const state = useAppState();
  const { inputs, outputs } = splitFlows(evaluate(plan, state).total.items);
  if (inputs.length === 0 && outputs.length === 0) return null;
  return (
    <span className={uiCss.flows}>
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
    <label className={uiCss.listItem} key={id} style={{ cursor: 'pointer' }}>
      <input
        type="checkbox"
        className={uiCss.checkbox}
        checked={checked || Boolean(neededBy)}
        disabled={Boolean(neededBy) && !checked}
        onChange={onToggle}
      />
      <span className={cx(uiCss.grow, 'stack')} style={{ gap: 2 }}>
        <span>{name}</span>
        <span className="t-body-sm muted">{meta}</span>
      </span>
      {neededBy && !checked && (
        <span className={uiCss.tag}>
          <Icon name="external" size={12} />
          {t.exchange.neededBy(neededBy)}
        </span>
      )}
    </label>
  );
  return (
    <Modal
      title={t.plan.export}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>{t.common.cancel}</Button>
          <Button
            variant="primary"
            disabled={file.calculations.length + file.workshops.length === 0}
            onClick={() => {
              download(exportFileName(now), JSON.stringify(file, null, 2));
              onClose();
            }}
          >
            {t.exchange.download}
          </Button>
        </>
      }
    >
      <label className="hstack" style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          className={uiCss.checkbox}
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
        {t.exchange.selectAll}
      </label>
      <div className="stack">
        <span className="t-label muted">{t.nav.calc}</span>
        {state.calculations.map((c) =>
          item(
            c.id,
            c.name,
            `${countLabel(c.rows.length, t.count.rows)}${c.built > 0 ? t.exchange.built(c.built) : ''}`,
            calculations.has(c.id),
            deps.calculations.get(c.id),
            () => toggle(calculations, c.id, setCalculations),
          ),
        )}
      </div>
      <div className="stack">
        <span className="t-label muted">{t.nav.workshops}</span>
        {state.workshops.length === 0 && (
          <span className="muted t-body-sm">{t.workshops.none}</span>
        )}
        {state.workshops.map((w) =>
          item(
            w.id,
            w.name,
            countLabel(w.rows.length, t.count.rows),
            workshops.has(w.id),
            deps.workshops.get(w.id),
            () => toggle(workshops, w.id, setWorkshops),
          ),
        )}
      </div>
      <div
        className={cx(uiCss.listItem, 't-num-sm secondary')}
        style={{ background: 'var(--bg-app)' }}
      >
        {exportFileName(now)} ·{' '}
        {countLabel(file.calculations.length, t.count.calculations)},{' '}
        {countLabel(file.workshops.length, t.count.workshops)} ·{' '}
        {t.exchange.game(catalog.version)}
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
      title={t.plan.import}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>{t.common.cancel}</Button>
          <Button
            variant="primary"
            disabled={!file}
            onClick={() => {
              if (!file) return;
              setState(() => applyImport(getState(), file.data, mode));
              onClose();
            }}
          >
            {t.exchange.importAction}
          </Button>
        </>
      }
    >
      <div className={uiCss.listItem} style={{ background: 'var(--bg-app)' }}>
        <Icon name="arrowDown" size={20} />
        <span className={cx(uiCss.grow, 'stack')} style={{ gap: 2 }}>
          <span className="t-num">{file?.name ?? t.exchange.noFile}</span>
          {file && (
            <span className="t-body-sm muted">
              {t.exchange.game(file.data.gameVersion)} ·{' '}
              {t.exchange.exportedOn(
                formatDate(new Date(file.data.exportedAt)),
              )}{' '}
              · {countLabel(entries.length, t.count.entries)}
            </span>
          )}
        </span>
        <Button variant="ghost" onClick={pick}>
          {file ? t.exchange.otherFile : t.exchange.chooseFile}
        </Button>
      </div>
      {error && <span className={uiCss.errorText}>{error}</span>}
      {file && file.data.gameVersion !== catalog.version && (
        <div className={uiCss.banner}>
          <Icon name="alert" color="var(--status-warning)" />
          <span className="t-body-sm">
            {t.exchange.versionMismatch(file.data.gameVersion, catalog.version)}
          </span>
        </div>
      )}
      {file && (
        <div className="stack">
          <span className="t-label muted">{t.exchange.contents}</span>
          {entries.map((entry) => (
            <div className={uiCss.listItem} key={`${entry.kind}:${entry.id}`}>
              <Icon name={entry.kind === 'workshop' ? 'chain' : 'gauge'} />
              <span className={uiCss.grow}>
                {entry.kind === 'workshop'
                  ? t.exchange.workshopEntry(entry.name)
                  : t.exchange.calculationEntry(entry.name)}
              </span>
              <span
                className={cx(
                  uiCss.badge,
                  entry.exists ? uiCss.warn : uiCss.ok,
                )}
              >
                {entry.exists ? t.exchange.exists : t.exchange.isNew}
              </span>
            </div>
          ))}
        </div>
      )}
      {duplicates > 0 && (
        <div className="stack">
          <span className="t-label muted">
            {t.exchange.duplicates(duplicates)}
          </span>
          <button
            type="button"
            className={cx(uiCss.option, mode === 'copy' && uiCss.active)}
            onClick={() => setMode('copy')}
          >
            <span className="stack" style={{ gap: 2 }}>
              <span>{t.exchange.copy}</span>
              <span className="t-body-sm muted">{t.exchange.copyHint}</span>
            </span>
          </button>
          <button
            type="button"
            className={cx(uiCss.option, mode === 'replace' && uiCss.active)}
            onClick={() => setMode('replace')}
          >
            <span className="stack" style={{ gap: 2 }}>
              <span>{t.exchange.replace}</span>
              <span className="t-body-sm muted">{t.exchange.replaceHint}</span>
            </span>
          </button>
        </div>
      )}
    </Modal>
  );
};
