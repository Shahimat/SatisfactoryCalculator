import { type ReactNode, useEffect } from 'react';

import { iconUrl } from '../catalog';
import { Icon, type IconName } from './icons';
import { cx } from '../cx';
import uiCss from './ui.module.css';
import { t } from '../i18n';

export const GameIcon = ({
  id,
  size = 'md',
}: {
  id: string;
  size?: 'sm' | 'md' | 'lg';
}) => (
  <img
    className={cx(uiCss.itemIcon, size !== 'md' && uiCss[size])}
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
    className={cx(uiCss.btn, uiCss[`btn-${variant}`])}
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
    className={uiCss.iconBtn}
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
      className={uiCss.overlay}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={uiCss.modal}
        style={{ maxWidth: width }}
        role="dialog"
        aria-label={title}
      >
        <div className={uiCss.modalHeader}>
          <h2 className="t-heading">{title}</h2>
          <IconButton icon="close" title={t.common.close} onClick={onClose} />
        </div>
        <div className={uiCss.modalBody}>{children}</div>
        {footer && <div className={uiCss.modalFooter}>{footer}</div>}
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
  <div className={uiCss.field} style={width ? { width } : { flex: 1 }}>
    <span className={cx(uiCss.fieldLabel, 't-label muted')}>
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
  <div className={uiCss.input}>
    <input
      type="number"
      value={Number.isFinite(value) ? value : ''}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
    />
    {suffix && <span className="t-num-sm muted">{suffix}</span>}
  </div>
);

export { Select, type SelectOption } from './select';
