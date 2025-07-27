import { Palette, PaletteOptions } from '@mui/material/styles/createPalette';

declare module '@mui/material/styles/createPalette' {
  export interface Palette {
    button: {
      primary: string;
      secondary: string;
      card: string;
      disabled: string;
    };
    card: {
      background: string;
      backgroundSelected: string;
    };
    link: {
      primary: string;
    };
  }
  export interface PaletteOptions {
    button: {
      primary: string;
      secondary: string;
      card: string;
      disabled: string;
    };
    card: {
      background: string;
      backgroundSelected: string;
    };
    link: {
      primary: string;
    };
  }
}
