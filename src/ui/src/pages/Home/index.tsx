import { Box, BoxProps, Typography } from '@mui/material';
import { useAppDispatch } from 'hooks/store';
import { useEffect, useState } from 'react';
import { store } from 'store';
import { addOneCalculation, selectorCalculation } from 'store/calculation';

import SFDialog from 'components/shared/Dialog';

interface HomePageProps extends BoxProps {}

const HomePage = (props: HomePageProps) => {
  const [open, setOpen] = useState(false);
  const calculation = selectorCalculation.selectAll(store.getState());
  const dispatch = useAppDispatch();
  console.log('calculation: ', calculation);

  useEffect(() => {
    dispatch(addOneCalculation({ id: 10, name: '101' }));
  }, []);

  return (
    <Box className={'home-page'}>
      <Typography variant={'h1'}>Hello world!</Typography>
      <SFDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onAccept={() => {
          setOpen(false);
        }}
        tabs={[
          {
            title: 'WOW',
            content: (
              <div>
                <div>wfwf</div>
                <div>wfwf</div>
                <div>wfwf</div>
                <div>wfwf</div>
                <div>wfwf</div>
                <div>wfwf</div>
                <div>wfwf</div>
                <div>wfwf</div>
              </div>
            ),
          },
          {
            title: 'DA',
            content: (
              <div>
                <div>daaa</div>
                <div>daaa</div>
                <div>daaa</div>
              </div>
            ),
          },
          {
            title: 'Some',
            content: (
              <div>
                <div>some</div>
                <div>some</div>
                <div>some</div>
              </div>
            ),
          },
        ]}
      />
    </Box>
  );
};

export default HomePage;
