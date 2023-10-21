import { SvgIcon, Tooltip, useTheme } from '@mui/material';
import { MouseEventHandler, useCallback, useMemo, useState } from 'react';

import './index.scss';

interface CardButtonProps {
  icon: any;
  iconDrawType?: 'fill' | 'stroke';
  disabled?: boolean;
  tooltip?: string;
  onClick?: () => void;
}

const CardButton = (props: CardButtonProps) => {
  const {
    icon,
    iconDrawType = 'fill',
    disabled = false,
    tooltip = '',
    onClick,
  } = props;
  const theme = useTheme();
  const [active, setActive] = useState<string>('false');

  const svgStyles = useMemo<any>(
    () => ({
      fill: iconDrawType === 'stroke' ? 'none' : theme.palette.primary.main,
      stroke: iconDrawType === 'fill' ? 'none' : theme.palette.primary.main,
      opacity: disabled ? 0.5 : 1,
    }),
    [iconDrawType, disabled, theme],
  );

  const handleCardButtonMouseDown = useCallback<
    MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      if (!disabled) {
        setActive('true');
        if (onClick) {
          onClick();
        }
      }
    },
    [disabled, onClick, setActive],
  );

  const handleCardButtonMouseUp = useCallback<
    MouseEventHandler<HTMLDivElement>
  >(
    (event) => {
      setActive('false');
    },
    [setActive],
  );

  return (
    <div
      className={'card-button'}
      data-active={active}
      onMouseDown={handleCardButtonMouseDown}
      onMouseUp={handleCardButtonMouseUp}
    >
      <Tooltip title={tooltip} enterDelay={700}>
        <div className={'card-button__draw'}>
          <SvgIcon component={icon} viewBox={'0 0 30 30'} style={svgStyles} />
        </div>
      </Tooltip>
    </div>
  );
};

export default CardButton;
