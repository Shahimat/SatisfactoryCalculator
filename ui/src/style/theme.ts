import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme } from '@mui/material';
import { ruRU } from '@mui/material/locale';

const theme = createTheme(
  {
    typography: {
      fontFamily: 'roboto, sans-serif',
      h1: {
        fontSize: '6rem',
        fontWeight: 300,
        color: '#FFFFFF',
      },
      h2: {
        fontSize: '4rem',
        fontWeight: 300,
        color: '#FFFFFF',
      },
      h3: {
        fontSize: '3rem',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      h4: {
        fontSize: '2.125rem',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      h5: {
        fontSize: '1.5rem',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      h6: {
        fontSize: '1.25rem',
        fontWeight: 500,
        color: '#FFFFFF',
      },
      subtitle1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      subtitle2: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#FFFFFF',
      },
      body1: {
        fontSize: '1rem',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      body2: {
        fontSize: '0.875rem',
        fontWeight: 400,
        color: '#FFFFFF',
      },
      button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#FFFFFF',
      },
      caption: {
        fontSize: '0.75rem',
        fontWeight: 400,
        color: '#FFFFFF',
      },
    },
    palette: {
      background: {
        default: '#202125',
        paper: '#8B8B8B',
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
        card: '#d9d9d9',
        disabled: '#9c9c9c',
      },
      card: {
        background: '#837f82',
        backgroundSelected: '#566269',
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
