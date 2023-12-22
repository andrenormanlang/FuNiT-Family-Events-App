import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import EventCard from './EventCard';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { db, eventsCol } from '../../services/firebase';
import { Event } from '../../types/Event.types';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const EventGrid = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const auth = getAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(eventsCol);
      const eventsData = querySnapshot.docs.map((doc) => ({
        ...doc.data() as Event,
        id: doc.id,
      }));
      setEvents(eventsData);
    };

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
  }, []);

  return (
    <Box display="flex" justifyContent="center" marginTop={1} marginBottom={4}>
            <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '1000px' }}>
        {events.map((event) => (
          <Grid item key={event.id} xs={5} sm={5} md={4.1} lg={4} xl={4}>
            <EventCard event={event} isSaved={savedEventIds.includes(event.id)} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default EventGrid;