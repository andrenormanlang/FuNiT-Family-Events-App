import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { SnackbarProvider } from './contexts/SnackBarProvider.tsx';
import AuthContextProvider from './contexts/AuthContextProvider.tsx';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            {' '}
            {/* Wrap your app with ThemeProvider */}
            <BrowserRouter>
                <SnackbarProvider>
                    <AuthContextProvider>
                        <App />
                    </AuthContextProvider>
                </SnackbarProvider>
            </BrowserRouter>
        </ThemeProvider>
    </React.StrictMode>
);
