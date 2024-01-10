import { createTheme } from '@mui/material/styles';
import {} from '@mui/material/colors';
import { typography } from './typography';

declare module '@mui/material/styles/createPalette' {
  interface Palette {
    sunnyYellow?: PaletteColor;
    skyBlue?: PaletteColor;
    grassGreen?: PaletteColor;
    oceanTeal?: PaletteColor;
    sunsetOrange: PaletteColor;
    bubblegumPink: PaletteColor;
    lavenderPurple: PaletteColor;
    mintGreen: PaletteColor;
    peachyCoral: PaletteColor;
    berryRed: PaletteColor;
    // ...other custom colors...
  }
  interface PaletteOptions {
    sunnyYellow?: PaletteColorOptions;
    skyBlue?: PaletteColorOptions;
    grassGreen?: PaletteColorOptions;
    oceanTeal?: PaletteColorOptions;
    sunsetOrange: PaletteColorOptions;
    bubblegumPink: PaletteColorOptions;
    lavenderPurple: PaletteColorOptions;
    mintGreen: PaletteColorOptions;
    peachyCoral: PaletteColorOptions;
    berryRed: PaletteColorOptions;
    // ...other custom colors...
  }
}

const theme = createTheme({
    typography: typography,
    palette: {
        primary: {
            main: '#1976D2',
            light: '#E0F2F7',
            dark: '#0D47A1',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#ce4e7c',
            light: '#FF8A65',
            contrastText: '#1c1c1c',
        },
        success: {
            main: '#4CAF50',
            light: '#81C784',
            dark: '#388E3C',
            contrastText: '#1c1c1c'
        },
        warning: {
            main: '#FFC107',
            light: '#FFD54F',
            dark: '#FFA000',
            contrastText: '#1c1c1c'
        },
        info: {
            main: '#007bff',
            light: '#4FC3F7',
            dark: '#0D47A1',
            contrastText: '#ffffff'
        },
        error: {
            main: '#191970',
            light: 'red',
            dark: 'red',
        },
        // You can continue adding as many as you need
        background: {
            default: '#7AD9E0',
            paper: '#fff'
        },
        sunnyYellow: {
          main: '#FFD54F'
        },
        skyBlue: {
          main: '#4FC3F7'
        },
        grassGreen: {
          main: '#81C784'
        },
        oceanTeal: {
          main: '#4DB6AC'
        },
        sunsetOrange: {
          main: '#FF8A65'
        },
        bubblegumPink: {
          main: '#F06292'
        },
        lavenderPurple: {
          main: '#BA68C8'
        },
        mintGreen: {
          main: '#AED581'
        },
        peachyCoral: {
          main: '#FFAB91'
        },
        berryRed: {
          main: '#E57373'
        }       
        
    },
    
});

export default theme;
