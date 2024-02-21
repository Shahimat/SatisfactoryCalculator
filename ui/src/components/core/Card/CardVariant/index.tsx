import { Typography } from '@mui/material';
import _, { isNil } from 'lodash';
import { CardVariantEnum } from 'models/card-table-notation/card-variant.enum';
import { ReactNode, useMemo } from 'react';
import { calcCardHeight, calcCardWidth } from 'utils/card.util';

import { FlexContainer, FlexItem } from 'components/core/Flex';

import BaseCard, { BaseCardProps } from '../BaseCard';

export interface CardVariantProps extends BaseCardProps {
  variant?: CardVariantEnum;
  title?: string;
  icon?: string;
  link?: string;
  value?: string;
  measure?: string;
}

const CardVariant = ({
  variant = CardVariantEnum.Default,
  title,
  icon,
  link,
  value,
  measure,
  ...props
}: CardVariantProps) => {
  const content = useMemo(() => {
    if (!isNil(title)) {
      // @TODO: LINK! -> icon + linkpath
      return [
        title ? (
          <Typography>
            {title}
            {link ? link : ''}
          </Typography>
        ) : null,
      ];
    } else if (!isNil(icon) && !isNil(value)) {
      return [
        <Typography>{icon}</Typography>,
        <Typography>{value}</Typography>,
        measure ? <Typography>{measure}</Typography> : null,
      ];
    } else if (!isNil(icon)) {
      return [<Typography>{icon}</Typography>];
    } else {
      return [];
    }
    // switch (variant) {
    //   case CardVariantEnum.Default:
    //   case CardVariantEnum.Info: {
    //     return [
    //       icon ? <Typography>{icon}</Typography> : null,
    //       value ? <Typography>{value}</Typography> : null,
    //       measure ? <Typography>{measure}</Typography> : null,
    //     ];
    //   }
    //   case CardVariantEnum.ActionInfo: {
    //     return [<Typography></Typography>];
    //   }
    //   case CardVariantEnum.Consumption: {
    //     return [<Typography></Typography>];
    //   }
    //   case CardVariantEnum.Production: {
    //     return [<Typography></Typography>];
    //   }
    //   // @TODO: LINK! -> icon + linkpath
    //   case CardVariantEnum.Total: {
    //     return [
    //       title ? (
    //         <Typography>
    //           {title}
    //           {link ? link : ''}
    //         </Typography>
    //       ) : null,
    //     ];
    //   }
    // }
  }, []);
  // const width = useMemo<string>(() => calcCardWidth(size), [size]);
  // const height = useMemo<string>(() => calcCardHeight(1), []);
  // const renderContent = useMemo<ReactNode[]>(
  //   () =>
  //     _.filter(content, (item) => !isNil(item)).map((item, index) => (
  //       <FlexItem
  //         key={_.uniqueId('base_card')}
  //         flex={flex[index] ?? '1 0 content'}
  //       >
  //         <FlexContainer
  //           height={'100%'}
  //           justifyContent={'center'}
  //           alignItems={'center'}
  //         >
  //           <FlexItem flex={'0 0 content'}>{item}</FlexItem>
  //         </FlexContainer>
  //       </FlexItem>
  //     )),
  //   [content],
  // );

  // return (
  //   <FlexContainer
  //     width={width}
  //     height={height}
  //     flexDirection={'column'}
  //     alignItems={'center'}
  //     style={{ backgroundColor: color, color: '#FFFFFF' }}
  //   >
  //     {renderContent}
  //   </FlexContainer>
  // );
  return <BaseCard content={content} {...props} />;
};

export default CardVariant;
