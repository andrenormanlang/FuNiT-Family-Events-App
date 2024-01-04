import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar, SnackbarCloseReason } from '@mui/material';

interface SnackbarContextType {
    showMessage: (msg: string) => void;
}

const SnackbarContext = createContext<SnackbarContextType | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useSnackbar = (): SnackbarContextType => {
    const context = useContext(SnackbarContext);
    if (!context) {
        throw new Error('useSnackbar must be used within a SnackbarProvider');
    }
    return context;
};

interface SnackbarProviderProps {
    children: ReactNode;
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    const showMessage = (msg: string) => {
        setMessage(msg);
        setOpen(true);
    };

    const handleClose = (_event: React.SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <SnackbarContext.Provider value={{ showMessage }}>
            <Snackbar
                open={open}
                autoHideDuration={6000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                message={message}
            />
            {children}
        </SnackbarContext.Provider>
    );
};
