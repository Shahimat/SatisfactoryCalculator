import { useTheme } from '@mui/material';
import AddIcon from 'assets/images/action/add.svg';
import CloseIcon from 'assets/images/action/close.svg';
import CollapseIcon from 'assets/images/action/collapse.svg';
import ExpandIcon from 'assets/images/action/expand.svg';
import ArrowDownIcon from 'assets/images/arrow/down.svg';
import ArrowUpIcon from 'assets/images/arrow/up.svg';
import {
  CARD_GAP,
  CARD_HEIGHT,
  CARD_NUMBERS,
  CARD_WIDTH,
} from 'models/constants/card-size';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { calcCardWidth } from 'utils/card.util';

import CardButton from 'components/core/Card/CardButton';
import CardCheckbox from 'components/core/Card/CardCheckbox';
import { FlexContainer, FlexItem } from 'components/core/Flex';

import CardName from '../patterns/CardName';
import CardGroupItem from './CardGroupItem';

interface CardGroupProps {
  infoBlock?: ReactNode;
  firstBlock?: ReactNode;
  secondBlock?: ReactNode;
  // type?: 'standard' | 'total';
  // name?: string;
  checked?: boolean;
  expanded?: boolean;
  size?: number;
  // checked?: boolean;
  hasCheckButton?: boolean;
  hasUpButton?: boolean;
  hasDownButton?: boolean;
  hasExpandButton?: boolean;
  hasCloseButton?: boolean;
  hasAddButton?: boolean;
  setChecked?: (value: boolean) => void;
  setExpanded?: (value: boolean) => void;
  onUp?: () => void;
  onDown?: () => void;
  onRemove?: () => void;
}

const CardGroup = (props: CardGroupProps) => {
  const {
    // type = 'standard',
    // name,
    infoBlock = null,
    firstBlock = null,
    secondBlock = null,
    checked = false,
    expanded = false,
    size = CARD_NUMBERS,
    hasCheckButton = true,
    hasUpButton = true,
    hasDownButton = true,
    hasExpandButton = false,
    hasCloseButton = true,
    hasAddButton = false,
    setChecked = () => {},
    setExpanded = () => {},
    onUp = () => {},
    onDown = () => {},
    onRemove = () => {},
  } = props;
  const theme = useTheme();
  const sx = useMemo(
    () => ({
      boxSizing: 'border-box',
      // width: `${size * (CARD_WIDTH + CARD_GAP) + CARD_GAP}rem`,
      width: '100%',
      height: `${CARD_GAP + CARD_HEIGHT}rem`,
      background: checked
        ? theme.palette.card.backgroundSelected
        : theme.palette.card.background,
      padding: `${CARD_GAP / 2}rem`,
    }),
    [theme, size, checked],
  );

  const handleCheckboxSwitch = useCallback(() => {
    if (setChecked) {
      setChecked(!checked);
    }
  }, [checked, setChecked]);

  const handleExpandSwitch = useCallback(() => {
    if (setExpanded) {
      setExpanded(!expanded);
    }
  }, [expanded, setExpanded]);

  const flexBasisInfoBlock = useMemo(() => calcCardWidth(4), []);

  return (
    <FlexContainer boxSizing={'border-box'} sx={sx}>
      <FlexItem boxSizing={'border-box'} flex={`0 0 ${CARD_WIDTH}rem`}>
        <FlexContainer flexWrap={'wrap'} justifyContent={'flex-end'}>
          {hasCheckButton && (
            <FlexItem flex={'0 0 content'}>
              <CardCheckbox checked={checked} onClick={handleCheckboxSwitch} />
            </FlexItem>
          )}
          {hasUpButton && (
            <FlexItem flex={'0 0 content'}>
              <CardButton icon={ArrowUpIcon} onClick={onUp} />
            </FlexItem>
          )}
          {hasExpandButton && (
            <FlexItem flex={'0 0 content'}>
              <CardButton
                icon={expanded ? CollapseIcon : ExpandIcon}
                onClick={handleExpandSwitch}
              />
            </FlexItem>
          )}
          {hasDownButton && (
            <FlexItem flex={'0 0 content'}>
              <CardButton icon={ArrowDownIcon} onClick={onDown} />
            </FlexItem>
          )}
        </FlexContainer>
      </FlexItem>
      <FlexItem
        boxSizing={'border-box'}
        padding={`0 ${CARD_GAP}rem`}
        flex={'1 0 0'}
      >
        <FlexContainer boxSizing={'border-box'}>
          <FlexItem flex={`0 0 ${flexBasisInfoBlock}`}>{infoBlock}</FlexItem>
          <FlexItem flex={'1 0 0'}>{firstBlock}</FlexItem>
          <FlexItem flex={'1 0 0'}>{secondBlock}</FlexItem>
        </FlexContainer>
      </FlexItem>
      <FlexItem boxSizing={'border-box'} flex={`0 0 ${CARD_WIDTH}rem`}>
        <FlexContainer flexWrap={'wrap'} justifyContent={'flex-end'}>
          {hasAddButton && (
            <FlexItem flex={'0 0 content'}>
              <CardButton icon={AddIcon} onClick={() => {}} />
            </FlexItem>
          )}
          {hasCloseButton && (
            <FlexItem flex={'0 0 content'}>
              <CardButton icon={CloseIcon} onClick={onRemove} />
            </FlexItem>
          )}
        </FlexContainer>
      </FlexItem>
    </FlexContainer>
  );
};

export default CardGroup;
