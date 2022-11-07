import { Box, BoxProps, Typography } from '@mui/material';

interface SchemesAndItemsProps extends BoxProps {}

const SchemesAndItems = (props: SchemesAndItemsProps) => {
  return (
    <Box className={'schemes-and-items-page'}>
      <Typography variant={'h1'}>This is Schemes & Items!</Typography>
    </Box>
  );
};

export default SchemesAndItems;
