import AdminEventsTable from './AdminEventsTable';
import useStreamEvents from '../../hooks/useStreamEvents';
import { Box, CircularProgress, Container, Typography } from '@mui/material';

const AdminEventsListPage = () => {
    const { events, isLoading, error } = useStreamEvents();

    if (isLoading)
        return (
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
        );
    if (error) return <div>Error: {error}</div>;

    return (
        <Container maxWidth="xl">
            {' '}
            {/* Set the maxWidth similar to Navbar */}
            <Typography variant="h4" component="h2" gutterBottom>
                Events Review List
            </Typography>
            <AdminEventsTable events={events} />
        </Container>
    );
};

export default AdminEventsListPage;
