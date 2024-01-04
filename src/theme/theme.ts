import { createTheme } from '@mui/material/styles';
import {} from '@mui/material/colors';
import { typography } from './typography';

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
            main: '#F44336',
            contrastText: '#fff'
        },
        success: {
            main: '#4CAF50'
        },
        warning: {
            main: '#FFC107'
        },
        info: {
            main: '#007bff'
        },
        error: {
            main: '#d32f2f'
        },
        // You can continue adding as many as you need
        background: {
            default: '#7AD9E0',
            paper: '#fff'
        }
    }
});

export default theme;
