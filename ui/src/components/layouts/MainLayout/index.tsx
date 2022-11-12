import _ from 'lodash';
import { useLocation } from 'react-router-dom';
import { Outlet, Link } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from 'hooks/store';
import { selectorRouter, RouterPage } from 'store/router';

import { Typography, useTheme, Box, BoxProps } from '@mui/material';

import logoIcon from 'assets/logo.webp';

import './index.scss';
import { FlexContainer, FlexItem } from 'components/core/Flex';

const HEADER_HEIGHT = '4rem';
const MASTER_WIDTH = '10rem';
const BODY_HEIGHT = `calc(100% - ${HEADER_HEIGHT})`;
const DETAIL_WIDTH = `calc(100% - ${MASTER_WIDTH})`;

const links = [
  { label: 'Калькулятор', path: '/', group: 'Калькулятор' },
  { label: 'Заводы', path: '/plants', group: 'Заводы' },
  { label: 'Схемы', path: '/schemes', group: 'Схемы и предметы' },
  { label: 'Фабрики', path: '/factories', group: 'Схемы и предметы' },
  { label: 'Предметы', path: '/items', group: 'Схемы и предметы' },
  { label: 'Иконки', path: '/icons', group: 'Схемы и предметы' },
  { label: 'Помощь', path: '/help', group: 'Помощь' },
];

interface MainLayoutProps extends BoxProps {}

const MainLayout = (props: MainLayoutProps) => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const currentRoute = useAppSelector(selectorRouter);

  return (
    <Box id={'main-layout'} width={'100vw'} height={'100vh'}>
      <Box
        display={'flex'}
        id={'header'}
        minWidth={'100%'}
        maxWidth={'100%'}
        minHeight={HEADER_HEIGHT}
        maxHeight={HEADER_HEIGHT}
        overflow={'hidden'}
        style={{
          backgroundColor: theme.palette.primary.main,
        }}
      >
        <FlexContainer>
          <FlexItem flex={'0 0 content'}>
            <img
              src={logoIcon}
              alt={'wow'}
              loading="lazy"
              style={{ height: '64px' }}
            />
          </FlexItem>
          <FlexItem boxSizing={'border-box'} flex={'1 0 0'} marginLeft={'4rem'}>
            <nav className={'nav-panel'}>
              <ul className={'nav-panel__list'}>
                {_.uniqBy(links, 'group').map((link, index) => (
                  <li
                    key={`nav-list-item${index}`}
                    className={'nav-panel__list-item'}
                    style={{
                      textDecoration: 'none',
                      marginRight: '3rem',
                      boxSizing: 'border-box',
                      padding: '0.25rem',
                      borderBottom: `2px solid ${
                        currentRoute === link.path
                          ? theme.palette.link.primary
                          : 'transparent'
                      }`,
                    }}
                  >
                    <Link
                      to={link.path}
                      className={'nav-panel__list-item__link'}
                    >
                      <Typography
                        variant={'h5'}
                        color={theme.palette.link.primary}
                      >
                        {link.group}
                      </Typography>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </FlexItem>
        </FlexContainer>
      </Box>
      <Box
        id={'body'}
        display={'flex'}
        minWidth={'100%'}
        maxWidth={'100%'}
        minHeight={BODY_HEIGHT}
        maxHeight={BODY_HEIGHT}
        overflow={'hidden'}
      >
        <Box
          id={'master-panel'}
          minWidth={MASTER_WIDTH}
          maxWidth={MASTER_WIDTH}
          minHeight={'100%'}
          maxHeight={'100%'}
          overflow={'auto'}
          style={{
            backgroundColor: theme.palette.secondary.main,
          }}
        >
          <Typography variant={'body1'}>Wow</Typography>
        </Box>
        <Box
          id={'detail-panel'}
          boxSizing={'border-box'}
          padding={'2rem'}
          minWidth={DETAIL_WIDTH}
          maxWidth={DETAIL_WIDTH}
          minHeight={'100%'}
          maxHeight={'100%'}
          overflow={'auto'}
          style={{
            backgroundColor: theme.palette.background.default,
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
