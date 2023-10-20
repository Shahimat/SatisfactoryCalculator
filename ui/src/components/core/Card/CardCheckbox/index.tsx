import { useMemo } from 'react';
import { Checkbox, CheckboxProps, useTheme } from '@mui/material';

interface CardCheckboxProps extends CheckboxProps {}

const CardCheckbox = (props: CardCheckboxProps) => {
  const theme = useTheme();
  const sx = useMemo(
    () => ({
      color: theme.palette.button.card,
      padding: 0,
      width: '2.5rem',
      height: '2.5rem',
      '& > svg': {
        width: '100%',
        height: '100%',
        viewBox: '3 3 18 18',
      },
      '&.Mui-checked': {
        color: theme.palette.button.card,
      },
    }),
    [theme],
  );

  return <Checkbox {...props} sx={sx} />;
};

export default CardCheckbox;
