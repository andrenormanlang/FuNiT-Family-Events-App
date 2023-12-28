import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy  } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppEvent } from '../types/Event.types';
import useAuth from './useAuth';

const useStreamEvents = () => {
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { signedInUserInfo } = useAuth();

    useEffect(() => {
        const eventsCol = collection(db, 'events');
        // const q = query(eventsCol);

        let q;
        if (signedInUserInfo?.isAdmin) {
            // Admins see all events
            q = query(eventsCol, orderBy('eventDateTime', 'asc'));
        } else {
            // Non-admins see only approved events
            q = query(eventsCol, where('isApproved', '==', true), orderBy('eventDateTime', 'asc'));
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const eventData = snapshot.docs.map((doc) => ({
                    ...(doc.data() as AppEvent),
                    id: doc.id
                }));
                console.log("Fetched events:", eventData);
                setEvents(eventData);
                setIsLoading(false);
            },
            
            (err) => { 
                console.error('Error getting events: ', err);             
                setError(err.message);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [signedInUserInfo?.isAdmin]);

    return { events, isLoading, error };
};

export default useStreamEvents;
