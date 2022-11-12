import { PaletteOptions, Palette } from '@mui/material/styles/createPalette';

declare module '@mui/material/styles/createPalette' {
  export interface Palette {
    button: {
      primary: string;
      secondary: string;
    };
    link: {
      primary: string;
    };
  }
  export interface PaletteOptions {
    button: {
      primary: string;
      secondary: string;
    };
    link: {
      primary: string;
    };
  }
}
