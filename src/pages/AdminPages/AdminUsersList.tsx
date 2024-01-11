import AdminUsersTable from './AdminUsersTable';
import useStreamUsers from '../../hooks/useStreamUsers';
import { Box, CircularProgress, Container, Typography } from '@mui/material';

const AdminUsersListPage = () => {
    const { users, isLoading, error } = useStreamUsers();

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems=""
                minHeight="100vh" // This makes the Box take the full viewport height
            >
                <CircularProgress color="success" size={80} /> {/* Increase the size here */}
            </Box>
        );
    }
    if (error) return <div>Error: {error}</div>;

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h2" gutterBottom>
                Users
            </Typography>
            <AdminUsersTable users={users} />
        </Container>
    );
};

export default AdminUsersListPage;
