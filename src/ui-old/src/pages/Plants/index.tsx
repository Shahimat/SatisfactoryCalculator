import { Box, BoxProps, SvgIcon, Typography } from '@mui/material';
import addIcon from 'assets/images/action/add.svg';
import FactoryIcon from 'assets/images/other/factory.svg';
import { CardVariantEnum } from 'models/card-table-notation/card-variant.enum';
import { useState } from 'react';

import BaseCard from 'components/core/Card/BaseCard';
import CardButton from 'components/core/Card/CardButton';
import CardCheckbox from 'components/core/Card/CardCheckbox';
import CardVariant from 'components/core/Card/CardVariant';

import CardGroup from 'components/shared/Card/CardGroup';
import CardTable from 'components/shared/CardTable';
import SFDialog from 'components/shared/Dialog';
import SFTable from 'components/shared/Table';

interface PlantsProps extends BoxProps {}

const Plants = (props: PlantsProps) => {
  const [checked, setChecked] = useState<boolean>(false);
  return (
    <Box className={'plants-page'}>
      <CardTable notation={{ cardGroups: [{ cards: [] }, { cards: [] }] }} />
      <BaseCard size={1} color={'green'} content={['wow', 'da', 'flex']} />
      <CardVariant variant={CardVariantEnum.Production} />
      {/* <SFTable /> */}
      {/* <SFDialog
        open={true}
        tabs={[
          {
            key: 'some',
            title: 'hello',
            content: <Typography>worjgrwugiurwgiu hiurw woig</Typography>,
          },
          {
            key: 'some2',
            title: 'hello',
            content: <Typography>worjgrwugiurwgiu hiurw woig</Typography>,
          },
        ]}
      /> */}
      {/* <BaseCard
        size={2}
        content={['some', 'wow', 'da']}
        flex={['1 0 content', '0 0 content', '0 0 content']}
      />
      <CardGroup checked={checked} setChecked={setChecked} /> */}
    </Box>
  );
};

export default Plants;
