import _, { isNil } from 'lodash';
import { ReactNode, useMemo } from 'react';
import { FlexContainer, FlexItem } from 'components/core/Flex';
import { calcCardHeight, calcCardWidth } from 'utils/card.util';

export interface BaseCardProps {
  size?: number;
  color?: string;
  content?: ReactNode[];
  flex?: string[];
}

const BaseCard = ({
  size = 1,
  color = '#111416',
  content = [],
  flex = [],
}: BaseCardProps) => {
  const width = useMemo<string>(() => calcCardWidth(size), [size]);
  const height = useMemo<string>(() => calcCardHeight(1), []);
  const renderContent = useMemo<ReactNode[]>(
    () =>
      _.filter(content, (item) => !isNil(item)).map((item, index) => (
        <FlexItem
          key={_.uniqueId('base_card')}
          flex={flex[index] ?? '1 0 content'}
        >
          <FlexContainer
            height={'100%'}
            justifyContent={'center'}
            alignItems={'center'}
          >
            <FlexItem flex={'0 0 content'}>{item}</FlexItem>
          </FlexContainer>
        </FlexItem>
      )),
    [content],
  );

  return (
    <FlexContainer
      width={width}
      height={height}
      flexDirection={'column'}
      alignItems={'center'}
      style={{ backgroundColor: color, color: '#FFFFFF' }}
    >
      {renderContent}
    </FlexContainer>
  );
};

export default BaseCard;
