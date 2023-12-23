import React, { useEffect, useState, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import EventCard from './EventCard';
import { getDocs, query, where, limit, startAfter, collection, QueryDocumentSnapshot } from 'firebase/firestore';
import { db, eventsCol } from '../../services/firebase';
import { Event } from '../../types/Event.types';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '@mui/material/styles';

const EventGrid = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
    const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<Event> | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const auth = getAuth();
    const theme = useTheme();

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const querySnapshot = await getDocs(query(eventsCol, limit(6)));
            const eventsData = querySnapshot.docs.map((doc) => ({ ...(doc.data() as Event), id: doc.id }));
            setEvents(eventsData);
            setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
        setIsLoading(false);
    };

    const fetchSavedEvents = async (userId: string) => {
        try {
            const q = query(collection(db, 'savedEvents'), where('userId', '==', userId));
            const querySnapshot = await getDocs(q);
            setSavedEventIds(querySnapshot.docs.map((doc) => doc.data().eventData.id));
        } catch (error) {
            console.error('Error fetching saved events:', error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchSavedEvents(user.uid);
            } else {
                setSavedEventIds([]);
            }
        });
        fetchEvents();
        return () => unsubscribe();
    }, [auth]);

    const loadMoreEvents = async () => {
      if (isLoading || !lastVisible) {
          return;
      }
      setIsLoading(true);
      setTimeout(async () => {
          try {
              const next = query(eventsCol, startAfter(lastVisible), limit(6));
              const querySnapshot = await getDocs(next);
              if (!querySnapshot.empty) {
                  const nextEvents = querySnapshot.docs.map(doc => ({ ...(doc.data() as Event), id: doc.id }));
                  setEvents(prevEvents => [...prevEvents, ...nextEvents]);
                  setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
              }
          } catch (error) {
              console.error('Error loading more events:', error);
          }
          setIsLoading(false);
      }, 1000); // 2 seconds delay
  };
    const handleScroll = useCallback(() => {
      const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
  
      // Only load more events if scrolling near the bottom of the page
      if (scrollTop + window.innerHeight + 50 >= scrollHeight && lastVisible) {
          loadMoreEvents();
      }
    }, [loadMoreEvents, isLoading]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    return (
        <Box display="flex" justifyContent="center" marginTop={1} marginBottom={theme.spacing(4)}>
            <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '1000px' }}>
                {events.map((event) => (
                    <Grid item key={event.id} xs={8} sm={7} md={4} lg={4} xl={4}>
                        <EventCard event={event} isSaved={savedEventIds.includes(event.id)} />
                    </Grid>
                ))}
                {isLoading && (
                    <Box display="flex" justifyContent="center" alignItems="center" height="100px">
                        <CircularProgress />
                    </Box>
                )}
            </Grid>
        </Box>
    );
};

export default EventGrid;
