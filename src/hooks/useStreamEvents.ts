import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppEvent } from '../types/Event.types';
import useAuth from './useAuth';



const useStreamEvents = ({
    categoryFilter = '',
    ageGroupFilter = '',
    selectedMonth = '',
    cityFilter = ''
} = {}) => {
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { signedInUserInfo } = useAuth();
    

    useEffect(() => {
        let q = query(collection(db, 'events'));

        if (signedInUserInfo?.isAdmin) {
            q = query(q, orderBy('eventDateTime', 'asc'));
        } else {
            q = query(q, where('isApproved', '==', true), orderBy('eventDateTime', 'asc'));
        }

        const conditions = [];
        if (categoryFilter) {
            q = query(q, where('category', '==', categoryFilter));
        }
        if (ageGroupFilter) {
            q = query(q, where('ageGroup', '==', ageGroupFilter));
        }
        if (cityFilter) {
            conditions.push(where('city', '==', cityFilter));
        }
        if (selectedMonth) {
            const [monthName, year] = selectedMonth.split('-');
            const monthIndex = new Date(`${monthName} 1 ${year}`).getMonth(); // Get the month index
            const startOfMonth = new Date(Number(year), monthIndex, 1);
            const endOfMonth = new Date(Number(year), monthIndex + 1, 0, 23, 59, 59);
            q = query(q, where('eventDateTime', '>=', startOfMonth), where('eventDateTime', '<=', endOfMonth));
        }

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allEvents = snapshot.docs.map(doc => ({ ...(doc.data() as AppEvent), id: doc.id }));
            // Filter events on the client side
            const filteredEvents = allEvents.filter(event => event.address.includes(cityFilter));
            setEvents(filteredEvents);
            setIsLoading(false);
        }, (err) => {
            setError(err.message);
            setIsLoading(false);
        });
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [signedInUserInfo?.isAdmin, signedInUserInfo?.uid, categoryFilter, ageGroupFilter, selectedMonth, cityFilter]);

    return { events, isLoading, error };
};

export default useStreamEvents;