import React, { useEffect, useState } from 'react';
import AdminEventsTable from './AdminEventsTable';
import useStreamEvents from '../../hooks/useStreamEvents';
import Search from '../../components/MUI/Search';
import { Box, CircularProgress, Container, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

const AdminEventsListPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [isDateSearch, setIsDateSearch] = useState<boolean>(false);
    const { events, isLoading, error } = useStreamEvents({ searchTerm, isDateSearch });

    const handleSearch = (term: string, dateSearch: boolean) => {
        setSearchTerm(term);
        setIsDateSearch(dateSearch);

        const newSearchParams = new URLSearchParams();
        newSearchParams.set('query', term);
        newSearchParams.set('dateSearch', dateSearch.toString());
        setSearchParams(newSearchParams);
    };

    useEffect(() => {
        const query = searchParams.get('query') || '';
        const dateSearch = searchParams.get('dateSearch') === 'true';
        setSearchTerm(query);
        setIsDateSearch(dateSearch);
    }, [searchParams]);

    const renderSearchResultsMessage = () => {
        if (searchTerm && !isLoading && !error && events.length > 0) {
            return (
                <Typography variant="subtitle1" gutterBottom>
                    {`There are ${events.length} events ${isDateSearch ? `on ${searchTerm}` : `with the term '${searchTerm}'`}`}
                </Typography>
            );
        }
        return null; // Display nothing if no search term is entered or no results are found
    };

    const renderContent = () => {
        if (isLoading) {
            return <CircularProgress />;
        }
        if (error) {
            return <div>Error: {error}</div>;
        }
        const eventCount = events.length;
        const eventWord = eventCount === 1 ? 'event' : 'events'; // Singular or plural
        const isOrAre = eventCount === 1 ? 'is' : 'are'; // Singular or plural verb
        const onOrWith = isDateSearch ? 'on this date' : 'with this term'; // Context for search

        if (eventCount === 0 && searchTerm) {
            return (
                <div>
                    No {eventWord} {onOrWith}
                </div>
            );
        } else if (eventCount === 1 && searchTerm) {
            return (
                <div>
                    There {isOrAre} {eventCount} {eventWord} {onOrWith}
                </div>
            );
        }
        return <AdminEventsTable events={events} searchTerm={searchTerm} />;
    };

    return (
        <Container maxWidth="xl">
            <Typography variant="h4" component="h2" gutterBottom>
                Events Review List
            </Typography>
            <Search onSearch={handleSearch} placeholder={isDateSearch ? 'Search by date...' : 'Search events...'} />
            {renderSearchResultsMessage()}
            <Box mt={2}>
                {' '}
                {/* Set the top margin here */}
                {renderContent()}
            </Box>
        </Container>
    );
};

export default AdminEventsListPage;
