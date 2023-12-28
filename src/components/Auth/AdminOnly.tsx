import { Box, CircularProgress, Typography } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface IProps {
    children: React.ReactNode;
    redirectTo?: string;
}

const AdminOnly: React.FC<IProps> = ({ children, redirectTo = '/' }) => {
    const { signedInUser, signedInUserInfo } = useAuth();

    if (!signedInUserInfo) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="">
                <Box textAlign="center">
                    <CircularProgress />
                    <Typography variant="h6" marginTop={2}>
                        Checking authorization...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return signedInUser && signedInUserInfo.isAdmin ? <>{children}</> : <Navigate to={redirectTo} />;
};

export default AdminOnly;
