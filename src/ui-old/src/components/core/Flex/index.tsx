import { Box, BoxProps } from '@mui/material';

export interface FlexContainerProps extends BoxProps {}

export interface FlexItemProps extends BoxProps {}

export const FlexContainer = ({
  children,
  display,
  width,
  component,
  flexDirection,
  ...props
}: FlexContainerProps) => {
  return (
    <Box
      display={display ?? 'flex'}
      width={width ?? '100%'}
      component={component ?? 'div'}
      flexDirection={flexDirection ?? 'row'}
      {...props}
    >
      {children}
    </Box>
  );
};

export const FlexItem = ({
  children,
  display,
  width,
  component,
  ...props
}: FlexItemProps) => {
  return (
    <Box
      display={display ?? 'block'}
      width={width ?? '100%'}
      component={component ?? 'div'}
      {...props}
    >
      {children}
    </Box>
  );
};
