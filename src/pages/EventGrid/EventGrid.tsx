import { useEffect, useState } from 'react';
import {Grid, Box} from '@mui/material';
import EventCard from './EventCard';
import { getDocs, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, eventsCol } from '../../services/firebase';
import { Event } from '../../types/Event.types';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '@mui/material/styles';
import Pagination from '../../components/MUI/Pagintation'
import { useSearchParams } from 'react-router-dom';


const EventGrid = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const auth = getAuth();
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const itemsPerPage = 6; // Number of items per page

  useEffect(() => {

     const fetchEvents = () => {
      // Add an orderBy clause to your query to sort events by date
      const q = query(eventsCol, orderBy('eventDateTime', 'asc')); // Assuming 'eventDate' is your date field

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const eventsData = querySnapshot.docs.map((doc) => ({
          ...doc.data() as Event,
          id: doc.id,
        }));
        setEvents(eventsData);
      });

      return unsubscribe;
    };
      // Return the unsubscribe function to ensure we clean up the listener when the component unmounts
     
    const fetchSavedEvents = async (userId: string) => {
      const q = query(collection(db, 'savedEvents'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const savedIds = querySnapshot.docs.map((doc) => doc.data().eventData.id);
      setSavedEventIds(savedIds);
    };

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, fetch saved events
        fetchSavedEvents(user.uid);
      } else {
        // User is signed out, clear saved events
        setSavedEventIds([]);
      }
    });

    // Fetch all events
    fetchEvents();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (value: number) => {
    setPage(value);
    setSearchParams({ page: value.toString() }); // Update the URL
  };

  const eventsForPage = events.slice((page - 1) * itemsPerPage, page * itemsPerPage);



  return (
    <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>
      <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '1000px' }}>
        {eventsForPage.map((event) => (
          <Grid item key={event.id} xs={8} sm={7} md={4} lg={4} xl={4}>
            <EventCard event={event} isSaved={savedEventIds.includes(event.id)} />
          </Grid>
        ))}
      </Grid>
      <Box display="flex" justifyContent="center" marginTop={2} marginBottom={2}>
        <Pagination count={Math.ceil(events.length / itemsPerPage)} page={page} onPageChange={handlePageChange} />
      </Box>
    </Box>
  );
};

export default EventGrid;