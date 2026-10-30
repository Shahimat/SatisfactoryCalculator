import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Icon } from './icons';
import { cx } from '../cx';
import selectCss from './select.module.css';
import uiCss from './ui.module.css';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Secondary text on the right, e.g. a building or an amount. */
  hint?: string;
};

/**
 * Focuses an input once it mounts. Preact only sets the `autofocus` attribute,
 * which browsers ignore on elements added after page load.
 */
const focusOnMount = (input: HTMLInputElement | null) => input?.focus();

/** Long lists get a search box; short ones are picked at a glance. */
const SEARCH_FROM = 10;

/**
 * Dropdown with icons: the native select cannot show images, and items,
 * buildings and Somersloops are recognised by their icons first.
 */
export const Select = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);
  const searchable = options.length >= SEARCH_FROM;
  const visible = options.filter((o) =>
    o.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const show = () => {
    setQuery('');
    setActive(Math.max(0, options.indexOf(selected!)));
    setOpen(true);
  };
  const pick = (option: SelectOption<T> | undefined) => {
    if (!option) return;
    onChange(option.value);
    setOpen(false);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!open) {
      if (['ArrowDown', 'Enter', ' '].includes(event.key)) {
        event.preventDefault();
        show();
      }
      return;
    }
    if (event.key === 'Escape') {
      // Close the list, not the dialog around it.
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, visible.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      pick(visible[active]);
    }
  };

  return (
    <div className={selectCss.select} ref={root} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={cx(uiCss.input, selectCss.selectTrigger)}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
      >
        {selected?.icon}
        <span className={selectCss.selectLabel}>{selected?.label ?? '—'}</span>
        {selected?.hint && (
          <span className="t-num-sm muted">{selected.hint}</span>
        )}
        <Icon name="chevronDown" size={16} />
      </button>
      {open && (
        <div className={selectCss.selectPopup}>
          {searchable && (
            <div className={cx(uiCss.input, selectCss.selectSearch)}>
              <Icon name="search" size={16} color="var(--text-muted)" />
              <input
                ref={focusOnMount}
                placeholder="Поиск"
                value={query}
                onChange={(event) => {
                  setQuery(event.currentTarget.value);
                  setActive(0);
                }}
              />
            </div>
          )}
          <div className={selectCss.selectList} role="listbox" ref={list}>
            {visible.length === 0 && (
              <span className={cx(selectCss.selectEmpty, 'muted t-body-sm')}>
                Ничего не нашлось
              </span>
            )}
            {visible.map((option, index) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                data-index={index}
                className={cx(
                  selectCss.selectOption,
                  option.value === value && selectCss.selected,
                  index === active && selectCss.active,
                )}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(option)}
              >
                {option.icon}
                <span className={selectCss.selectLabel}>{option.label}</span>
                {option.hint && (
                  <span className="t-num-sm muted">{option.hint}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
