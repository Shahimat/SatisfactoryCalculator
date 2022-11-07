import { Box, BoxProps, Typography } from '@mui/material';

interface HomePageProps extends BoxProps {}

const HomePage = (props: HomePageProps) => {
  return (
    <Box className={'home-page'}>
      <Typography variant={'h1'}>Hello world!</Typography>
    </Box>
  );
};

export default HomePage;
