import { type ReactNode, useEffect } from 'react';

import { iconUrl } from '../catalog';
import { Icon, type IconName } from './icons';

export const GameIcon = ({
  id,
  size = 'md',
}: {
  id: string;
  size?: 'sm' | 'md' | 'lg';
}) => (
  <img
    className={`item-icon ${size === 'md' ? '' : size}`}
    src={iconUrl(id)}
    alt=""
    loading="lazy"
    onError={(event) => {
      event.currentTarget.style.visibility = 'hidden';
    }}
  />
);

type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: IconName;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
};

export const Button = ({
  variant = 'secondary',
  icon,
  children,
  onClick,
  disabled,
  title,
}: ButtonProps) => (
  <button
    type="button"
    className={`btn btn-${variant}`}
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {icon && <Icon name={icon} size={16} />}
    {children}
  </button>
);

export const IconButton = ({
  icon,
  title,
  onClick,
}: {
  icon: IconName;
  title: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    className="icon-btn"
    title={title}
    aria-label={title}
    onClick={onClick}
  >
    <Icon name={icon} size={18} />
  </button>
);

export const Modal = ({
  title,
  width = 640,
  onClose,
  footer,
  children,
}: {
  title: string;
  width?: number;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) => {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="modal"
        style={{ maxWidth: width }}
        role="dialog"
        aria-label={title}
      >
        <div className="modal-header">
          <h2 className="t-heading">{title}</h2>
          <IconButton icon="close" title="Закрыть" onClick={onClose} />
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};

export const Field = ({
  label,
  icon,
  children,
  width,
}: {
  label: string;
  /** Visual anchor next to the label: what the field is about. */
  icon?: ReactNode;
  children: ReactNode;
  width?: number;
}) => (
  <div className="field" style={width ? { width } : { flex: 1 }}>
    <span className="field-label t-label muted">
      {icon}
      {label}
    </span>
    {children}
  </div>
);

export const NumberInput = ({
  value,
  onChange,
  suffix,
  min,
  max,
  step,
  placeholder,
}: {
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}) => (
  <div className="input">
    <input
      type="number"
      value={Number.isFinite(value) ? value : ''}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.valueAsNumber)}
    />
    {suffix && <span className="t-num-sm muted">{suffix}</span>}
  </div>
);

export { Select, type SelectOption } from './select';
