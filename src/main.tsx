import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { SnackbarProvider } from './contexts/SnackBarProvider.tsx';
import AuthContextProvider from './contexts/AuthContextProvider.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <SnackbarProvider>
                <AuthContextProvider>
                    <App />
                </AuthContextProvider>
            </SnackbarProvider>
        </BrowserRouter>
    </React.StrictMode>
);
