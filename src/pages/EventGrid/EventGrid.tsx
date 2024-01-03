// // EventGrid.js
// import { useEffect, useState } from 'react';
// import {Grid, Box} from '@mui/material';
// import EventCard from './EventCard';
// import { getDocs, collection, query, where} from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
// import { useTheme } from '@mui/material/styles';
// import Pagination from '../../components/MUI/Pagination'
// import { useSearchParams } from 'react-router-dom';
// import useStreamEvents from '../../hooks/useStreamEvents';
// import useAuth from '../../hooks/useAuth';

// const EventGrid = () => {
//   const { events, isLoading, error } = useStreamEvents();
//   const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
//   const auth = getAuth();
//   const theme = useTheme();
//   const [searchParams] = useSearchParams();
//   const itemsPerPage = 6; // Number of items per page
//   const { signedInUserInfo } = useAuth();

//   useEffect(() => {
//     const fetchSavedEvents = async (userId: string) => {
//       const q = query(collection(db, 'savedEvents'), where('userId', '==', userId));
//       const querySnapshot = await getDocs(q);
//       const savedIds = querySnapshot.docs.map((doc) => doc.data().eventData.id);
//       setSavedEventIds(savedIds);
//     };

//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         fetchSavedEvents(user.uid);
//       } else {
//         setSavedEventIds([]);
//       }
//     });

//     return () => unsubscribe();
//   }, [auth]);

//   const page = Number(searchParams.get('page')) || 1;
//   const eventsForPage = events.slice((page - 1) * itemsPerPage, page * itemsPerPage);

//   if (isLoading) {
//     // Render loading state here
//   }

//   if (error) {
//     // Render error state here
//   }

//   return (
//     <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>
//       <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '1200px' }}>
//         {eventsForPage.map((event) => (
//           <Grid item key={event.id} xs={11} sm={5.5} md={5.5} lg={4} xl={4}>
//             <EventCard event={event} isSaved={savedEventIds.includes(event.id)} isAdmin={signedInUserInfo?.isAdmin || false}/>
//           </Grid>
//         ))}
//       </Grid>
//       <Box display="flex" justifyContent="center" marginTop={2} marginBottom={2}>
//         <Pagination count={Math.ceil(events.length / itemsPerPage)} />
//       </Box>
//     </Box>
//   );
// };

// export default EventGrid;

import { useState, useEffect } from 'react';
import { Grid, Box, FormControl, InputLabel, Select, MenuItem, Typography, Chip, Button } from '@mui/material';
import EventCard from './EventCard';
import useStreamEvents from '../../hooks/useStreamEvents';
import useAuth from '../../hooks/useAuth';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDocs, query, collection, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useTheme } from '@mui/material/styles';
import Pagination from '../../components/MUI/Pagination';
import { useSearchParams } from 'react-router-dom';
import { AppEvent } from '../../types/Event.types';

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
    const [searchParams] = useSearchParams();
    const itemsPerPage = 6; // Number of items per page
    const [categoryFilter, setCategoryFilter] = useState('');
    const [ageGroupFilter, setAgeGroupFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [filteredEvents, setFilteredEvents] = useState<AppEvent[]>([]);
    const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const { events, isLoading, error } = useStreamEvents({
        categoryFilter,
        ageGroupFilter,
        cityFilter,
        selectedMonth
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

    const resetFilters = () => {
        setCategoryFilter('');
        setAgeGroupFilter('');
        setCityFilter('');
        setSelectedMonth('');
        // Reset other filter states as needed
    };

    const page = Number(searchParams.get('page')) || 1;
    const eventsForPage = filteredEvents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

    return (
      <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>
          {/* Filter UI */}
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
      onChange={(e) => setCategoryFilter(e.target.value)}
      label="Category" // This should match the InputLabel
    >
      <MenuItem value="">
        <em>All Categories</em>
      </MenuItem>
      {categoryValues.map((category, index) => (
        <MenuItem key={index} value={category}>{category}</MenuItem>
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
      onChange={(e) => setAgeGroupFilter(e.target.value)}
      label="Age Group" // This should match the InputLabel
    >
                              <MenuItem value="">All Ages</MenuItem>
                              {ageGroups.map((ageGroup, index) => (
                                  <MenuItem key={index} value={ageGroup}>{ageGroup}</MenuItem>
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
      onChange={(e) => setSelectedMonth(e.target.value)}
      label="Category" // This should match the InputLabel
    >
       <MenuItem value="">All Months</MenuItem>
      {uniqueMonths.map((month, index) => (
          <MenuItem key={index} value={month}>{month}</MenuItem>
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
      onChange={(e) => setCityFilter(e.target.value)}
      label="City" // This should match the InputLabel
    >
                              <MenuItem value="">Both Cities</MenuItem>
                              <MenuItem value="Copenhagen">Copenhagen</MenuItem>
                              <MenuItem value="Malmö">Malmö</MenuItem>
                          </Select>
                      </FormControl>
              </Grid>



              {/* <FormControl sx={{ m: 1, minWidth: 120 }}>
                  <InputLabel>City</InputLabel>
                  <Select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}>
                      <MenuItem value="">All Cities</MenuItem>
                      <MenuItem value="Copenhagen">Copenhagen</MenuItem>
                      <MenuItem value="Malmö">Malmö</MenuItem>
                  </Select>
              </FormControl> */}
          </Grid>
          </Box>

          {/* Active Filters Display */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
              {categoryFilter && <Chip label={`Category: ${categoryFilter}`} onDelete={() => setCategoryFilter('')} color="primary" />}
              {ageGroupFilter && <Chip label={`Age Group: ${ageGroupFilter}`} onDelete={() => setAgeGroupFilter('')} color="primary" />}
              {cityFilter && <Chip label={`City: ${cityFilter}`} onDelete={() => setCityFilter('')} color="primary" />}
              {selectedMonth && <Chip label={`Month: ${selectedMonth}`} onDelete={() => setSelectedMonth('')} color="primary" />}
              <Button onClick={resetFilters} variant="contained" color="secondary" sx={{ ml: 1 }}>Reset Filters</Button>
          </Box>

          {/* Event Grid */}
          <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '1200px' }}>
              {isLoading ? (
                  <Typography>Loading...</Typography>
              ) : error ? (
                  <Typography>Error: {error}</Typography>
              ) : eventsForPage.length > 0 ? (
                  eventsForPage.map((event) => (
                      <Grid item key={event.id} xs={11} sm={5.5} md={5.5} lg={4} xl={4}>
                          <EventCard event={event} isSaved={savedEventIds.includes(event.id)} isAdmin={signedInUserInfo?.isAdmin || false} />
                      </Grid>
                  ))
              ) : (
                  <Typography>No events match your filters.</Typography>
              )}
          </Grid>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" marginTop={2} marginBottom={2}>
              <Pagination count={Math.ceil(filteredEvents.length / itemsPerPage)} />
          </Box>
      </Box>
  );
};

export default EventGrid;

