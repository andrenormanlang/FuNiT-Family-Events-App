import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppEvent } from '../types/Event.types';

const useStreamEvents = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const eventsCol = collection(db, 'events');
    const q = query(eventsCol); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventData = snapshot.docs.map(doc => ({
        ...doc.data() as AppEvent, 
        id: doc.id
      }));
      setEvents(eventData);
      setIsLoading(false);
    }, (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { events, isLoading, error };
};

export default useStreamEvents;
