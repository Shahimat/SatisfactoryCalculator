import _ from 'lodash';
import { Outlet, Link } from 'react-router-dom';
import { Typography, useTheme, Box, BoxProps } from '@mui/material';

import './index.scss';

const HEADER_HEIGHT = '4rem';
const MASTER_WIDTH = '10rem';
const BODY_HEIGHT = `calc(100% - ${HEADER_HEIGHT})`;
const DETAIL_WIDTH = `calc(100% - ${MASTER_WIDTH})`;

const links = [
  { label: 'Калькулятор', path: '/' },
  { label: 'Заводы', path: '/plants' },
  { label: 'Схемы и предметы', path: '/schemes_and_items' },
  { label: 'Помощь', path: '/help' },
];

interface MainLayoutProps extends BoxProps {}

const MainLayout = (props: MainLayoutProps) => {
  const theme = useTheme();

  return (
    <Box id={'main-layout'} width={'100vw'} height={'100vh'}>
      <Box
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
        <nav className={'nav-panel'}>
          <ul className={'nav-panel__list'}>
            {_.map(links, (link, index) => (
              <li
                key={`nav-list-item${index}`}
                className={'nav-panel__list-item'}
              >
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
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
