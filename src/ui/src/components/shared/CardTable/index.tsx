import { useTheme } from '@mui/material';
import CloseIcon from 'assets/images/action/close.svg';
import ArrowDownIcon from 'assets/images/arrow/down.svg';
import ArrowUpIcon from 'assets/images/arrow/up.svg';
import { ICardTableNotation } from 'models/card-table-notation/card-table-notation.interface';
import { CardGroupVariantEnum } from 'models/card-table-notation/card-variant.enum';
import { useCallback, useEffect, useMemo, useState } from 'react';

import BaseCard from 'components/core/Card/BaseCard';
import CardButton from 'components/core/Card/CardButton';
import CardCheckbox from 'components/core/Card/CardCheckbox';
import { FlexContainer, FlexItem } from 'components/core/Flex';

import CardGroup from '../Card/CardGroup';
import CardGroupItem from '../Card/CardGroup/CardGroupItem';

interface CardTableProps {
  notation: ICardTableNotation;
}

const CardTable = (props: CardTableProps) => {
  const { notation } = props;
  const theme = useTheme();

  const [checked, setChecked] = useState<{ ind: number; checked: boolean }[]>(
    [],
  );
  const [expanded, setExpanded] = useState<
    { ind: number; expanded: boolean }[]
  >([]);

  useEffect(() => {
    setChecked(notation.cardGroups.map((_, ind) => ({ ind, checked: false })));
    setExpanded(
      notation.cardGroups.map((_, ind) => ({ ind, expanded: false })),
    );
  }, [notation]);

  const onCheck = useCallback(
    (ind: number) => (value: boolean) => {
      setChecked(
        checked.map((item, itemInd) =>
          itemInd === ind ? { ind, checked: value } : item,
        ),
      );
    },
    [checked, setChecked],
  );

  const onExpand = useCallback(
    (ind: number) => (value: boolean) => {
      setExpanded(
        expanded.map((item, itemInd) =>
          itemInd === ind ? { ind, expanded: value } : item,
        ),
      );
    },
    [expanded, setExpanded],
  );

  // const sx = useMemo(
  //   () => ({
  //     boxSizing: 'border-box',
  //     width: `${size * (CARD_WIDTH + CARD_GAP) + CARD_GAP}rem`,
  //     height: `${CARD_GAP + CARD_HEIGHT}rem`,
  //     background: checked
  //       ? theme.palette.card.backgroundSelected
  //       : theme.palette.card.background,
  //     padding: `${CARD_GAP / 2}rem`,
  //   }),
  //   [theme, size, checked],
  // );

  return (
    <FlexContainer boxSizing={'border-box'} flexWrap={'wrap'}>
      <FlexItem flex={'0 0 100%'}></FlexItem>
      <FlexItem flex={'0 0 100%'}>
        <FlexContainer boxSizing={'border-box'} flexWrap={'wrap'}>
          {...notation.cardGroups.map((cardGroup, cardGroupInd) => {
            const variant = cardGroup.variant ?? CardGroupVariantEnum.Default;
            return (
              <FlexItem
                key={`card-group${cardGroupInd}`}
                boxSizing={'border-box'}
                marginTop={'0.25rem'}
                flex={'0 0 100%'}
              >
                <CardGroup
                  setChecked={onCheck(cardGroupInd)}
                  setExpanded={onExpand(cardGroupInd)}
                  hasAddButton={[CardGroupVariantEnum.Chain].includes(variant)}
                  hasCheckButton={[
                    CardGroupVariantEnum.Default,
                    CardGroupVariantEnum.UnitOfProduction,
                    CardGroupVariantEnum.Chain,
                    CardGroupVariantEnum.Plant,
                  ].includes(variant)}
                  hasCloseButton={[
                    CardGroupVariantEnum.Default,
                    CardGroupVariantEnum.UnitOfProduction,
                    CardGroupVariantEnum.Chain,
                    CardGroupVariantEnum.Plant,
                  ].includes(variant)}
                  hasUpButton={[
                    CardGroupVariantEnum.Default,
                    CardGroupVariantEnum.UnitOfProduction,
                    CardGroupVariantEnum.Chain,
                    CardGroupVariantEnum.Plant,
                  ].includes(variant)}
                  hasDownButton={[
                    CardGroupVariantEnum.Default,
                    CardGroupVariantEnum.UnitOfProduction,
                    CardGroupVariantEnum.Chain,
                    CardGroupVariantEnum.Plant,
                  ].includes(variant)}
                  hasExpandButton={[CardGroupVariantEnum.Chain].includes(
                    variant,
                  )}
                  checked={
                    checked.find((_, ind) => cardGroupInd === ind)?.checked ??
                    false
                  }
                  expanded={
                    expanded.find((_, ind) => cardGroupInd === ind)?.expanded ??
                    false
                  }
                  infoBlock={
                    <FlexContainer>
                      <FlexItem>
                        <BaseCard size={4} content={[<p>ИТОГО</p>]} />
                        {/* <CardGroupItem></CardGroupItem> */}
                      </FlexItem>
                    </FlexContainer>
                  }
                />
                {/* {...cardGroup.cards.map((card, cardInd) => (
                    <CardGroupItem
                      key={`card-group${cardGroupInd}-card${cardInd}`}
                    ></CardGroupItem>
                  ))} */}
              </FlexItem>
            );
          })}
        </FlexContainer>
      </FlexItem>
      {/* <FlexItem boxSizing={'border-box'} flex={`0 0 ${CARD_WIDTH}rem`}>
        <FlexContainer flexWrap={'wrap'} justifyContent={'flex-end'}>
          <FlexItem flex={'0 0 content'}>
            <CardCheckbox checked={checked} onClick={handleCheckboxSwitch} />
          </FlexItem>
          <FlexItem flex={'0 0 content'}>
            <CardButton icon={ArrowUpIcon} onClick={onUp} />
          </FlexItem>
          <FlexItem flex={'0 0 content'}>
            <CardButton icon={ArrowDownIcon} onClick={onDown} />
          </FlexItem>
        </FlexContainer>
      </FlexItem>
      <FlexItem flex={'1 0 0'}></FlexItem>
      <FlexItem boxSizing={'border-box'} flex={`0 0 ${CARD_WIDTH}rem`}>
        <FlexContainer flexWrap={'wrap'} justifyContent={'flex-end'}>
          <FlexItem flex={'0 0 content'}>
            <CardButton icon={CloseIcon} onClick={onRemove} />
          </FlexItem>
        </FlexContainer>
      </FlexItem> */}
    </FlexContainer>
  );
};

export default CardTable;
