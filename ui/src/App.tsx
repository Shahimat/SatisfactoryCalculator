import { ReactNode } from 'react';

import { Box } from '@mui/material';

interface AppProps {
  children?: ReactNode;
}

const App = (props: AppProps) => {
  return (
    <Box
      display={'flex'}
      component={'div'}
      width={'100%'}
      height={'80px'}
      color={'#FFFFFF'}
      style={{
        backgroundColor: '#000000',
      }}
      justifyContent={'center'}
      alignItems={'center'}
    >
      <Box width={'fit-content'} fontSize={'30px'}>
        Hello world!
      </Box>
    </Box>
  );
};

export default App;
