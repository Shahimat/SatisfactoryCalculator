import { createTheme } from '@mui/material';
import { ruRU } from '@mui/material/locale';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const theme = createTheme(
  {
    typography: {
      fontFamily: 'roboto, sans-serif',
      h1: {
        fontSize: '96px',
        fontWeight: 300,
        color: '#FFFFFF',
      },
      h2: {
        fontSize: '60px',
        fontWeight: 300,
        color: '#FFFFFF',
      },
      h3: {
        fontSize: '48px',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      h4: {
        fontSize: '34px',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      h5: {
        fontSize: '24',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      h6: {
        fontSize: '20px',
        fontWeight: 500,
        color: '#FFFFFF',
      },
      subtitle1: {
        fontSize: '16px',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      subtitle2: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#FFFFFF',
      },
      body1: {
        fontSize: '16px',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      body2: {
        fontSize: '14px',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      button: {
        fontSize: '14px',
        fontWeight: 500,
        color: '#FFFFFF',
      },
      caption: {
        fontSize: '12px',
        fontWeight: 400,
        color: '#FFFFFF',
      },
    },
    palette: {
      background: {
        default: '#202125',
      },
      primary: {
        main: '#111416',
      },
      secondary: {
        main: '#313236',
      },
      success: {
        main: '#49FF1C',
      },
      info: {
        main: '#EAAE01',
      },
      warning: {
        main: '#F96F43',
      },
      button: {
        primary: '#F2C800',
        secondary: '#FFFFFF',
      },
      link: {
        primary: '#EAAE01',
      },
      divider: '#FFFFFF',
    },
  },
  ruRU,
);

export default theme;
