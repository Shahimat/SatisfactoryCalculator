import {
  CARD_GAP,
  CARD_HEIGHT,
  CARD_NUMBERS,
  CARD_WIDTH,
} from 'models/constants/card-size';

import { FlexContainer, FlexItem } from 'components/core/Flex';

import CardName from 'components/shared/Card/patterns/CardName';

interface CardGroupItem {
  type?: 'standard' | 'total';
  name?: string;
  size?: number;
}

const CardGroupItem = (props: CardGroupItem) => {
  const { type = 'standard', name, size = CARD_NUMBERS - 2 } = props;

  return (
    <FlexContainer>
      <FlexItem></FlexItem>
      <FlexItem></FlexItem>
      <FlexItem></FlexItem>
    </FlexContainer>
  );
};

export default CardGroupItem;
