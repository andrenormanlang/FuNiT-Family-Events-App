import { useState, useEffect } from 'react';
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, Typography, Chip, Button, CircularProgress } from '@mui/material';
import EventCard from './EventCard';
import useStreamEvents from '../../hooks/useStreamEvents';
import useAuth from '../../hooks/useAuth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDocs, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useTheme } from '@mui/material/styles';
import Pagination from '../../components/MUI/Pagination';
import { useSearchParams } from 'react-router-dom';
import { AppEvent, Event } from '../../types/Event.types';
import Search from '../../components/MUI/Search';

const categoryValues = [
    'Art, Film & Books',
    'Community Festivals',
    'Cooking',
    'DIY',
    'Educational Activities',
    'Games',
    'Health and Wellness',
    'Music',
    'Outdoor Activities',
    'Theatre & Dance',
    'Other'
];
const ageGroups = ['1-3 Years', '4-6 Years', '7-9 Years', '7-12 Years', '10-12 Years', 'All Ages'];

const fetchUniqueMonths = async (): Promise<string[]> => {
    const eventsQuery = query(collection(db, 'events'), orderBy('eventDateTime', 'asc'));
    const querySnapshot = await getDocs(eventsQuery);
    const monthSet = new Set<string>();

    querySnapshot.forEach((doc) => {
        const eventDate = doc.data().eventDateTime.toDate();
        // Convert the month number to a month name, e.g., 0 -> January
        const monthName = eventDate.toLocaleString('default', { month: 'long' });
        const monthYear = `${monthName}-${eventDate.getFullYear()}`;
        monthSet.add(monthYear);
    });

    return Array.from(monthSet);
};

const EventGrid = () => {
    const { signedInUserInfo } = useAuth();
    const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
    const auth = getAuth();
    const theme = useTheme();
    const [searchParams, setSearchParams] = useSearchParams();
    const initialPage = Number(searchParams.get('page')) || 1;
    const initialCategory = searchParams.get('category') || '';
    const itemsPerPage = 6;
    const [categoryFilter, setCategoryFilter] = useState(initialCategory);
    const [ageGroupFilter, setAgeGroupFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [page, setPage] = useState(initialPage);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDateSearch, setIsDateSearch] = useState(false);
    const [filteredEvents, setFilteredEvents] = useState<AppEvent[]>([]);
    const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
    const [showSearch, setShowSearch] = useState(true);
    const [isFiltered, setIsFiltered] = useState(false);

    const toggleSearchFilters = () => {
        setShowSearch(!showSearch);
    };

    const { events, isLoading, error } = useStreamEvents({
        searchTerm,
        isDateSearch,
        categoryFilter,
        ageGroupFilter,
        cityFilter,
        selectedMonth,
        page
    });

    useEffect(() => {
        const fetchSavedEvents = async (userId: string) => {
            const q = query(collection(db, 'savedEvents'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            const savedIds = querySnapshot.docs.map((doc) => doc.data().eventData.id);
            setSavedEventIds(savedIds);
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchSavedEvents(user.uid);
            } else {
                setSavedEventIds([]);
            }
        });

        return () => unsubscribe();
    }, [auth]);
    // Apply filters to events
    useEffect(() => {
        setFilteredEvents(events);
    }, [events]);

    useEffect(() => {
        const loadMonths = async () => {
            const months = await fetchUniqueMonths();
            setUniqueMonths(months);
        };

        loadMonths();
    }, []);

    useEffect(() => {
        const params = searchParams;

        const pageParam = params.get('page');
        const categoryParam = params.get('category');
        const ageGroupParam = params.get('ageGroup');
        const cityParam = params.get('city');
        const monthParam = params.get('month');
        const searchTermParam = params.get('searchTerm');
        const isDateSearchParam = params.get('isDateSearch') === 'true'; // Convert string to boolean

        setPage(pageParam ? Number(pageParam) : 1);
        setCategoryFilter(categoryParam || '');
        setAgeGroupFilter(ageGroupParam || '');
        setCityFilter(cityParam || '');
        setSelectedMonth(monthParam || '');
        setSearchTerm(searchTermParam || '');
        setIsDateSearch(isDateSearchParam);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const params = new URLSearchParams();
        if (categoryFilter) params.set('category', categoryFilter);
        if (ageGroupFilter) params.set('ageGroup', ageGroupFilter);
        if (cityFilter) params.set('city', cityFilter);
        if (selectedMonth) params.set('month', selectedMonth);
        params.set('page', page.toString());
        setSearchParams(params);
    }, [categoryFilter, ageGroupFilter, cityFilter, selectedMonth, page, setSearchParams]);

    const handleFilterChange = (filterType: string, value: string) => {
        setPage(1);
        if (filterType === 'category') {
            setCategoryFilter(value);
            setSearchParams({ ...searchParams, category: value, page: '1' });
        } else if (filterType === 'ageGroup') {
            setAgeGroupFilter(value);
            setSearchParams({ ...searchParams, ageGroup: value, page: '1' });
        } else if (filterType === 'city') {
            setCityFilter(value);
            setSearchParams({ ...searchParams, city: value, page: '1' });
        } else if (filterType === 'selectedMonth') {
            setSelectedMonth(value);
            setSearchParams({ ...searchParams, selectedMonth: value, page: '1' });
        }
        setIsFiltered(true);
    };

    useEffect(() => {
        setFilteredEvents(events);
    }, [events]);

    const resetFilters = () => {
        setCategoryFilter('');
        setAgeGroupFilter('');
        setCityFilter('');
        setSelectedMonth('');
        setSelectedMonth('');
        setPage(1);
        setIsFiltered(false);
    };

    useEffect(() => {
        const newSearchParams = new URLSearchParams();

        if (categoryFilter) newSearchParams.set('category', categoryFilter);
        if (ageGroupFilter) newSearchParams.set('ageGroup', ageGroupFilter);
        if (cityFilter) newSearchParams.set('city', cityFilter);
        if (selectedMonth) newSearchParams.set('month', selectedMonth);
        if (searchTerm) newSearchParams.set('searchTerm', searchTerm);
        if (isDateSearch) newSearchParams.set('isDateSearch', isDateSearch.toString());

        newSearchParams.set('page', page.toString());

        setSearchParams(newSearchParams);
    }, [categoryFilter, ageGroupFilter, cityFilter, selectedMonth, page, searchTerm, isDateSearch, setSearchParams]);

    const handleSearch = (newSearchTerm: string, newIsDateSearch: boolean) => {
        setSearchTerm(newSearchTerm);
        setIsDateSearch(newIsDateSearch);
        setPage(1);
        // Update URL parameters
        setSearchParams({ ...searchParams, searchTerm: newSearchTerm, isDateSearch: newIsDateSearch.toString(), page: '1' });
    };

    const renderSearchResultsMessage = () => {
        if (searchTerm && !isLoading && !error) {
            const eventCount = events.length;
            const eventWord = eventCount === 1 ? 'event' : 'events'; // Singular or plural
            const onOrWith = isDateSearch ? 'on' : 'with the term';

            if (eventCount > 0) {
                return (
                    <Typography
                        variant="body2"
                        gutterBottom
                        sx={{
                            textTransform: 'uppercase',
                            fontFamily: '"Sansita", sans-serif',
                            fontSize: '1.3rem',
                            color: theme.palette.success.dark
                        }}
                    >
                        {`There ${eventCount === 1 ? 'is' : 'are'} ${eventCount} ${eventWord} ${onOrWith} '${searchTerm}'`}
                    </Typography>
                );
            } else {
                return (
                    <Typography
                        variant="body2"
                        gutterBottom
                        sx={{ textTransform: 'uppercase', fontFamily: '"Sansita", sans-serif', fontSize: '1.3rem', color: theme.palette.error.dark }}
                    >
                        {`There are no ${eventWord} ${onOrWith} '${searchTerm}'`}
                    </Typography>
                );
            }
        }
        return null; // Display nothing if no search term is entered or no results are found
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
    };

    const eventsForPage = filteredEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    console.log({ cityFilter, selectedMonth, categoryFilter, ageGroupFilter });

    return (
        <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>
            <Box sx={{ width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'flex-start', flexWrap: 'wrap', p: 2 }}>
                <Button onClick={toggleSearchFilters} variant="outlined" sx={{}}>
                    <Typography
                        variant="body2"
                        gutterBottom
                        sx={{ textTransform: 'uppercase', fontFamily: '"Sansita", sans-serif', fontSize: '1.3rem' }}
                    >
                        {showSearch ? 'Show Filters' : 'Show Search'}
                    </Typography>
                </Button>
            </Box>
            {/* Filter UI */}
            {showSearch ? (
                <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', p: 2 }}>
                    <Box sx={{ mb: 2, width: '100%', display: 'flex', flexDirection: 'column' }}>
                        <Search onSearch={handleSearch} />
                        {renderSearchResultsMessage()}
                    </Box>
                </Box>
            ) : (
                <Box sx={{ mb: 4, width: '100%', maxWidth: '1200px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', p: 2 }}>
                    <Grid container spacing={2} justifyContent="center">
                        {/* Category Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel id="category-label">Category</InputLabel>
                                <Select
                                    labelId="category-label"
                                    id="category-select"
                                    value={categoryFilter}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    label="Category" // This should match the InputLabel
                                >
                                    <MenuItem value="">
                                        <em>All Categories</em>
                                    </MenuItem>
                                    {categoryValues.map((category, index) => (
                                        <MenuItem key={index} value={category}>
                                            {category}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Age Group Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Age Group</InputLabel>
                                <Select
                                    labelId="category-label"
                                    id="category-select"
                                    value={ageGroupFilter}
                                    onChange={(e) => handleFilterChange('ageGroup', e.target.value)}
                                    label="Age Group" // This should match the InputLabel
                                >
                                    <MenuItem value="">All Ages</MenuItem>
                                    {ageGroups.map((ageGroup, index) => (
                                        <MenuItem key={index} value={ageGroup}>
                                            {ageGroup}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Date Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Month</InputLabel>
                                <Select
                                    labelId="month-label"
                                    id="month-select"
                                    value={selectedMonth}
                                    onChange={(e) => handleFilterChange('selectedMonth', e.target.value)} // Use 'selectedMonth', not 'month'
                                    label="Month"
                                >
                                    <MenuItem value="">All Months</MenuItem>
                                    {uniqueMonths.map((month, index) => (
                                        <MenuItem key={index} value={month}>
                                            {month}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* City Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>City</InputLabel>
                                <Select
                                    labelId="city-label"
                                    id="city-select"
                                    value={cityFilter}
                                    onChange={(e) => handleFilterChange('city', e.target.value)}
                                    label="City" // This should match the InputLabel
                                >
                                    <MenuItem value="">Both Cities</MenuItem>
                                    <MenuItem value="Copenhagen">Copenhagen</MenuItem>
                                    <MenuItem value="Malmö">Malmö</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Box sx={{ width: '100%', maxWidth: '1200px', justifyContent: 'flex-start', flexWrap: 'wrap', mt: 2 }}>
                        {categoryFilter && (
                            <Chip
                                label={`Category: ${categoryFilter}`}
                                sx={{
                                    fontFamily: '"Sansita", sans-serif',
                                    fontSize: '0.9rem',
                                    mr: 1,
                                    backgroundColor: theme.palette.secondary.light,
                                    color: theme.palette.secondary.contrastText
                                }}
                                onDelete={() => setCategoryFilter('')}
                            />
                        )}

                        {ageGroupFilter && (
                            <Chip
                                label={`Age Group: ${ageGroupFilter}`}
                                sx={{
                                    fontFamily: '"Sansita", sans-serif',
                                    fontSize: '0.9rem',
                                    mr: 1,
                                    backgroundColor: theme.palette.success.light,
                                    color: theme.palette.success.contrastText
                                }}
                                onDelete={() => setAgeGroupFilter('')}
                            />
                        )}
                        {cityFilter && (
                            <Chip
                                label={`City: ${cityFilter}`}
                                sx={{
                                    fontFamily: '"Sansita", sans-serif',
                                    fontSize: '0.9rem',
                                    mr: 1,
                                    backgroundColor: theme.palette.warning.light,
                                    color: theme.palette.warning.contrastText
                                }}
                                onDelete={() => setCityFilter('')}
                            />
                        )}
                        {selectedMonth && (
                            <Chip
                                label={`Month: ${selectedMonth}`}
                                sx={{ fontFamily: '"Sansita", sans-serif', fontSize: '0.9rem', mr: 1 }}
                                onDelete={() => setSelectedMonth('')}
                                color="error"
                            />
                        )}
                        <Button onClick={resetFilters} variant="contained" color="secondary" sx={{}}>
                            <Typography
                                variant="body2"
                                gutterBottom
                                sx={{ textTransform: 'uppercase', fontFamily: '"Sansita", sans-serif', fontSize: '1rem' }}
                            >
                                Reset Filters
                            </Typography>
                        </Button>
                    </Box>
                </Box>
            )}

            {/* Active Filters Display */}

            {/* Event Grid */}
            <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '1200px' }}>
                {isLoading ? (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        position="fixed" // Use fixed positioning
                        top="60%" // Adjust this to move the CircularProgress up
                        left="50%" // Center horizontally
                        style={{ transform: 'translate(-50%, -40%)' }} // Adjust the transform to align correctly
                    >
                        <CircularProgress color="secondary" size={100} />
                    </Box>
                ) : error ? (
                    <Typography>Error: {error}</Typography>
                ) : eventsForPage.length > 0 ? (
                    eventsForPage.map((event) => (
                        <Grid item key={event.id} xs={11} sm={5.5} md={5.5} lg={4} xl={4}>
                            <EventCard
                                event={event as Event}
                                isSaved={savedEventIds.includes(event.id)}
                                isAdmin={signedInUserInfo?.isAdmin || false}
                            />
                        </Grid>
                    ))
                ) : isFiltered ? (
                    <Typography>No events match this filter.</Typography>
                ) : (
                    <CircularProgress color="secondary" size={100} />
                )}
            </Grid>

            {/* Pagination */}
            <Box display="flex" justifyContent="center" marginTop={2} marginBottom={2}>
                <Pagination count={Math.ceil(filteredEvents.length / itemsPerPage)} onPageChange={handlePageChange} />
            </Box>
        </Box>
    );
};

export default EventGrid;
