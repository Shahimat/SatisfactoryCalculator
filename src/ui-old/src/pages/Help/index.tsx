import { Box, BoxProps, Typography } from '@mui/material';

interface PlantsProps extends BoxProps {}

const Plants = (props: PlantsProps) => {
  return (
    <Box className={'help-page'}>
      <Typography variant={'h1'}>This is Help!</Typography>
    </Box>
  );
};

export default Plants;
