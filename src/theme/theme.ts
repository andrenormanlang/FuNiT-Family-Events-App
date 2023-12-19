import { createTheme } from '@mui/material/styles';
import { blue, pink } from '@mui/material/colors';
import {typography} from './typography';

const theme = createTheme({
    typography: typography,
    palette: {
        primary: {
            main: blue[500], 
            contrastText: '#fff'
        },
        secondary: {
            main: pink[500], 
            contrastText: '#000'
        },
        background: {
            default:pink[300],
        }
    }
});

export default theme;
