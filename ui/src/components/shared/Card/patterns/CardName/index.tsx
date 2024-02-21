import { Typography } from '@mui/material';

import BaseCard, { BaseCardProps } from 'components/core/Card/BaseCard';

interface CardNameProps extends BaseCardProps {
  name: string;
}

const CardName = (props: CardNameProps) => {
  const { name, ...otherProps } = props;
  return (
    <BaseCard content={[<Typography>{name}</Typography>]} {...otherProps} />
  );
};

export default CardName;
