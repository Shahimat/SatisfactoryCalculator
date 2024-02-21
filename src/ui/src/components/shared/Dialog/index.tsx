import {
  Dialog,
  DialogProps,
  IconButton,
  styled,
  SvgIcon,
  useTheme,
} from '@mui/material';
import CloseIcon from 'assets/images/action/close.svg';
import _ from 'lodash';
import {
  MouseEvent,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { FlexContainer, FlexItem } from 'components/core/Flex';

import ActionButton from './components/ActionButton';

interface SFDialogProps extends Omit<DialogProps, 'children'> {
  tabs: {
    key?: string;
    title: string;
    content: ReactNode;
    disable?: boolean;
  }[];
  currentTab?: string;
  cancelText?: string;
  acceptText?: string;
  onChangeTab?: (currentTab: string) => void;
  onAccept?: (currentTab: string) => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-container > .MuiPaper-root': {
    borderRadius: '0',
    overflow: 'hidden',
  },
}));

const SFDialog = ({
  tabs,
  currentTab: currentTabKey,
  cancelText = 'Отмена',
  acceptText = 'Применить',
  onClose = () => {},
  onAccept = () => {},
  onChangeTab = () => {},
  ...props
}: SFDialogProps) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState<string>('');
  const actualTabs = useMemo<
    { key: string; title: string; content: ReactNode; disable: boolean }[]
  >(
    () =>
      _.map(tabs, (tab, index) => ({
        key: tab.key ?? `key${index}`,
        title: tab.title,
        content: tab.content,
        disable: _.isNil(tab.disable) ? false : tab.disable,
      })),
    [tabs],
  );

  const actualContent = useMemo<ReactNode | null>(
    () => _.find(actualTabs, { key: currentTab })?.content ?? null,
    [actualTabs, currentTab],
  );

  useEffect(() => {
    if (actualTabs && actualTabs.length > 0) {
      if (_.isNil(currentTabKey)) {
        setCurrentTab(actualTabs[0].key);
      } else {
        setCurrentTab(currentTabKey);
      }
    }
  }, [currentTabKey, actualTabs]);

  const handleTabClick = useCallback(
    (key: string) => () => {
      setCurrentTab(key);
    },
    [],
  );

  const handleCloseButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setTimeout(() => {
        onClose(event, 'backdropClick');
      }, 100);
    },
    [],
  );

  const handleAcceptButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setTimeout(() => {
        onAccept(currentTab);
      }, 100);
    },
    [currentTab],
  );

  return (
    <StyledDialog onClose={onClose} {...props}>
      <FlexContainer flexWrap={'wrap'} maxHeight={'80vh'}>
        <FlexItem flex={'0 1 100%'}>
          <FlexContainer>
            <FlexItem
              flex={'1 0 content'}
              style={{ backgroundColor: '#5C5C5C' }}
            >
              <FlexContainer>
                {_.map(actualTabs, (tab, index) => (
                  <FlexItem
                    key={tab.key}
                    flex={'0 0 content'}
                    borderRight={
                      index < actualTabs.length - 1
                        ? `1px solid ${theme.palette.background.paper}`
                        : 'none'
                    }
                  >
                    <ActionButton
                      actionType={tab.key === currentTab ? 'tabActive' : 'tab'}
                      onClick={handleTabClick(tab.key)}
                    >
                      {tab.title}
                    </ActionButton>
                  </FlexItem>
                ))}
              </FlexContainer>
            </FlexItem>
            <FlexItem flex={'0 0 content'} minWidth={'4rem'}>
              <FlexContainer justifyContent={'center'} alignItems={'center'}>
                <FlexItem flex={'0 0 content'}>
                  <IconButton
                    style={{ padding: '0.5rem' }}
                    onClick={handleCloseButtonClick}
                  >
                    <SvgIcon
                      component={CloseIcon}
                      viewBox={'0 0 30 30'}
                      style={{
                        color: theme.palette.button.secondary,
                        width: '1.25rem',
                        height: '1.25rem',
                      }}
                    />
                  </IconButton>
                </FlexItem>
              </FlexContainer>
            </FlexItem>
          </FlexContainer>
        </FlexItem>
        <FlexItem
          flex={'0 1 100%'}
          maxHeight={'50vh'}
          boxSizing={'border-box'}
          padding={'2rem'}
          overflow={'auto'}
        >
          {actualContent}
        </FlexItem>
        <FlexItem flex={'0 1 100%'}>
          <FlexContainer justifyContent={'flex-end'}>
            <FlexItem flex={'0 0 content'}>
              <ActionButton
                actionType={'cancel'}
                onClick={handleCloseButtonClick}
              >
                {cancelText}
              </ActionButton>
            </FlexItem>
            <FlexItem flex={'0 0 content'}>
              <ActionButton
                actionType={'accept'}
                onClick={handleAcceptButtonClick}
              >
                {acceptText}
              </ActionButton>
            </FlexItem>
          </FlexContainer>
        </FlexItem>
      </FlexContainer>
    </StyledDialog>
  );
};

export default SFDialog;
