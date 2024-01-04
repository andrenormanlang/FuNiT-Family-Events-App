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
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        position="fixed" // Use fixed positioning
                        top="40%" // Adjust this to move the CircularProgress up
                        left="50%" // Center horizontally
                        style={{ transform: 'translate(-50%, -40%)' }} // Adjust the transform to align correctly
                    >
                        <CircularProgress color="secondary" size={100} />
                    </Box>
                    <Typography variant="h2" marginTop={2}>
                        Checking authorization...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return signedInUser && signedInUserInfo.isAdmin ? <>{children}</> : <Navigate to={redirectTo} />;
};

export default AdminOnly;
