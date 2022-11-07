import { Box, BoxProps, Typography } from '@mui/material';

interface PlantsProps extends BoxProps {}

const Plants = (props: PlantsProps) => {
  return (
    <Box className={'plants-page'}>
      <Typography variant={'h1'}>This is Plants!</Typography>
    </Box>
  );
};

export default Plants;
