import React, { useState } from 'react';
import {  CircularProgress, Container, Typography } from '@mui/material';
import AdminEventsTable from './AdminEventsTable';
import useStreamEvents from '../../hooks/useStreamEvents';
import Search from '../../components/MUI/Search';

const AdminEventsListPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDateSearch, setIsDateSearch] = useState<boolean>(false);
    const { events, isLoading, error } = useStreamEvents({ searchTerm, isDateSearch });

    const handleSearch = (term: string, dateSearch: boolean) => {
        setSearchTerm(term);
        setIsDateSearch(dateSearch);
    };

    const renderSearchResultsMessage = () => {
        // Only display the message if a search term is entered and there are results
        if (searchTerm && !isLoading && !error && events.length > 0) {
            return (
                <Typography variant="subtitle1" gutterBottom>
                    {`There are ${events.length} events ${isDateSearch ? `on ${searchTerm}` : `with the term '${searchTerm}'`}`}
                </Typography>
            );
        }
        // Display nothing if no search term is entered
        return null;
    };

    const renderContent = () => {
        if (isLoading) {
            return <CircularProgress />;
        }
        if (error) {
            return <div>Error: {error}</div>;
        }
        if (events.length === 0 && searchTerm) {
            return <div>No events {isDateSearch ? 'on this date' : 'with this term'}</div>;
        }
        return <AdminEventsTable events={events} />;
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h2" gutterBottom>
                Events Review List
            </Typography>
            <Search onSearch={handleSearch} placeholder={isDateSearch ? "Search by date..." : "Search events..."} />
            {renderSearchResultsMessage()}
            {renderContent()}
        </Container>
    );
};

export default AdminEventsListPage;