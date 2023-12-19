import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import { Box } from '@mui/material';
import EventCard from './EventCard';
import { getDocs } from 'firebase/firestore';
import { eventsCol } from '../../services/firebase';
import { Event } from '../../types/Event.types';

const EventGrid = () => {
    const [events, setEvents] = useState<Event[]>([]);

    

    useEffect(() => {
        const fetchEvents = async () => {
          const querySnapshot = await getDocs(eventsCol);
          const eventsData = querySnapshot.docs.map(doc => {
            const data = doc.data() as Event;
            return {
              ...data,
              id: doc.id,
            };
          });
          setEvents(eventsData);
        };
    
        fetchEvents();
      }, []);

    return (
        <Box display="flex" justifyContent="center" marginTop={2}>
            <Grid container spacing={2} justifyContent="center" style={{ maxWidth: '1000px' }}>
                {events.map((event, index) => (
                    <Grid item key={index} xs={8} sm={8} md={8} lg={6} xl={4}>
                        <EventCard event={event} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default EventGrid;
