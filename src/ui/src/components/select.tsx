import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { Icon } from './icons';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
  /** Secondary text on the right, e.g. a building or an amount. */
  hint?: string;
};

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
  const onKeyDown = (event: KeyboardEvent) => {
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
    <div className="select" ref={root} onKeyDown={onKeyDown}>
      <button
        type="button"
        className="input select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? setOpen(false) : show())}
      >
        {selected?.icon}
        <span className="select-label">{selected?.label ?? '—'}</span>
        {selected?.hint && (
          <span className="t-num-sm muted">{selected.hint}</span>
        )}
        <Icon name="chevronDown" size={16} />
      </button>
      {open && (
        <div className="select-popup">
          {searchable && (
            <div className="input select-search">
              <Icon name="search" size={16} color="var(--text-muted)" />
              <input
                autoFocus
                placeholder="Поиск"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActive(0);
                }}
              />
            </div>
          )}
          <div className="select-list" role="listbox" ref={list}>
            {visible.length === 0 && (
              <span className="select-empty muted t-body-sm">
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
                className={[
                  'select-option',
                  option.value === value && 'selected',
                  index === active && 'active',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(option)}
              >
                {option.icon}
                <span className="select-label">{option.label}</span>
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
