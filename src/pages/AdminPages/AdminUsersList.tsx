import AdminUsersTable from './AdminUsersTable';
import useStreamUsers from '../../hooks/useStreamUsers';
import { CircularProgress, Container, Typography } from '@mui/material';

const AdminUsersListPage = () => {
    const { users, isLoading, error } = useStreamUsers();

    if (isLoading) return <CircularProgress />;
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