import React, { useState } from 'react';
import { Box, CircularProgress, Container, Typography, Switch, FormControlLabel } from '@mui/material';
import AdminEventsTable from './AdminEventsTable';
import useStreamEvents from '../../hooks/useStreamEvents';
import Search from '../../components/MUI/Search';

const AdminEventsListPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDateSearch, setIsDateSearch] = useState<boolean>(false);

    const { events, isLoading, error } = useStreamEvents({
        searchTerm, 
        isDateSearch
         // Ensuring this matches the expected structure in the useStreamEvents hook
        // ... other parameters if needed
    });

    const handleSearch = (term: string) => {
        console.log('Search term received:', term);
        setSearchTerm(term);
    };

    const handleSearchTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsDateSearch(event.target.checked);
        setSearchTerm(''); // Reset the search term when changing the search type
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" position="fixed" top="40%" left="50%" style={{ transform: 'translate(-50%, -40%)' }}>
                <CircularProgress color="secondary" size={100} />
            </Box>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
    console.log('Events:', events);
    console.log('Search term:', searchTerm);
    
    console.log('Error:', error);
    
    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h2" gutterBottom>
                Events Review List
            </Typography>
            <FormControlLabel
                control={<Switch checked={isDateSearch} onChange={handleSearchTypeChange} />}
                label="Date Search"
            />
            <Search onSearch={handleSearch} placeholder={isDateSearch ? "Search by date..." : "Search events..."} />
            <AdminEventsTable events={events} />
        </Container>
    );
};

export default AdminEventsListPage;