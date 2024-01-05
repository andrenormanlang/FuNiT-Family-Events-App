import AdminEventsTable from './AdminEventsTable';
import useStreamEvents from '../../hooks/useStreamEvents';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useState } from 'react';
import Search from '../../components/MUI/Search';

const AdminEventsListPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const { events, isLoading, error } = useStreamEvents({ searchTerm });

    // handleSearch now directly receives a string, not an object
    const handleSearch = (searchTerm: string) => {
        console.log('Search term received:', searchTerm);
        setSearchTerm(searchTerm); // directly use the searchTerm
    };

    console.log('Events:', events);

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="fixed"
                top="40%"
                left="50%"
                style={{ transform: 'translate(-50%, -40%)' }}
            >
                <CircularProgress color="secondary" size={100} />
            </Box>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h2" gutterBottom>
                Events Review List
            </Typography>
            <Search onSearch={handleSearch} placeholder="Search events..." />
            <AdminEventsTable events={events} />
        </Container>
    );
};

export default AdminEventsListPage;