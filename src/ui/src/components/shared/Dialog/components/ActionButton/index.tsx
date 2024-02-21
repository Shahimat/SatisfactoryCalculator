import { Button, ButtonProps, styled } from '@mui/material';
import { ReactNode } from 'react';

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'actionType',
})<{
  actionType: 'accept' | 'cancel' | 'tabActive' | 'tab';
}>(({ theme, actionType }) => ({
  fontSize: theme.typography.subtitle1.fontSize,
  fontWeight: theme.typography.subtitle1.fontWeight,
  color:
    actionType === 'accept'
      ? theme.palette.secondary.main
      : theme.typography.subtitle1.color,
  padding:
    actionType === 'accept' || actionType === 'cancel'
      ? '1rem 4rem'
      : '0.25rem 2rem',
  textTransform: 'none',
  '&.MuiButton-root': {
    backgroundColor:
      actionType === 'accept'
        ? '#C5C5C5'
        : actionType === 'cancel'
        ? '#707070'
        : actionType === 'tabActive'
        ? theme.palette.background.paper
        : '#707070',
    boxShadow: 'none',
    borderRadius: '0',
  },
}));

interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  children?: ReactNode;
  padding?: string;
  actionType?: 'accept' | 'cancel' | 'tabActive' | 'tab';
}

const ActionButton = ({
  children,
  actionType = 'tab',
  ...props
}: ActionButtonProps) => {
  return (
    <StyledButton variant={'contained'} actionType={actionType} {...props}>
      {children ?? (actionType === 'accept' ? 'Применить' : 'Отмена')}
    </StyledButton>
  );
};

export default ActionButton;
