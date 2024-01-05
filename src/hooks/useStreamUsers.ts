import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppEvent, Category } from '../types/Event.types';
import useAuth from './useAuth';
import algoliasearch from 'algoliasearch/lite';

// Initialize Algolia search client
const searchClient = algoliasearch(
    import.meta.env.VITE_ALGOLIA_APP_ID,
    import.meta.env.VITE_ALGOLIA_SEARCH_ONLY_API_KEY
);

const index = searchClient.initIndex('events_index');

interface Hit {
    objectID: string;
    category?: string;
    ageGroup?: string;
    address?: string;
    name?: string;
    eventDateTime?: number;
    isDateSearch?: boolean; // Add this line
   
}

interface UseStreamEventsProps {
    searchTerm: string;
    categoryFilter: string;
    ageGroupFilter: string;
    selectedMonth: string;
    cityFilter: string;
    page: number;
    isDateSearch: boolean; // Add this line
}

const useStreamEvents = ({
    searchTerm,
    categoryFilter,
    ageGroupFilter,
    selectedMonth,
    cityFilter,
    page,
    isDateSearch, // Add this
}: UseStreamEventsProps) => {
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');
    const { signedInUserInfo } = useAuth();

    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            try {
                if (searchTerm) {
                    let queryResults;
                    if (isDateSearch) {
                        const timestamp = new Date(searchTerm).getTime();
                        queryResults = await index.search<Hit>('', {
                            numericFilters: [
                                `eventDateTime >= ${timestamp}`,
                                `eventDateTime <= ${timestamp + 86400000}`,
                            ],
                        });
                    } else {
                        queryResults = await index.search<Hit>(searchTerm);
                    }

                    const transformedHits = queryResults.hits.map((hit) => ({
                        id: hit.objectID,
                            name: hit.name || '',
                            category: hit.category as Category || 'Other', // Cast the category to Category type
                            address: hit.address || '',
                            ageGroup: hit.ageGroup || '',
                            eventDateTime: hit.eventDateTime || 0,
                            // Adjust as needed for your data format
                        // ... other fields
                    }));

                    setEvents(transformedHits);
                } else {
                    // Firestore query setup
                    let q = query(collection(db, 'events'));

                    if (signedInUserInfo?.isAdmin) {
                        q = query(q, orderBy('eventDateTime', 'asc'));
                    } else {
                        q = query(q, where('isApproved', '==', true), orderBy('eventDateTime', 'asc'));
                    }

                    // Apply additional filters
                    if (categoryFilter) {
                        q = query(q, where('category', '==', categoryFilter));
                    }
                    if (ageGroupFilter) {
                        q = query(q, where('ageGroup', '==', ageGroupFilter));
                    }
                    if (cityFilter) {
                        q = query(q, where('city', '==', cityFilter));
                    }
                    if (selectedMonth) {
                        const [monthName, year] = selectedMonth.split('-');
            const monthIndex = new Date(`${monthName} 1 ${year}`).getMonth();
            const startOfMonth = new Date(Number(year), monthIndex, 1);
            const endOfMonth = new Date(Number(year), monthIndex + 1, 0, 23, 59, 59);
            q = query(q, where('eventDateTime', '>=', startOfMonth), where('eventDateTime', '<=', endOfMonth));
                    }

                    // Execute the Firestore query
                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const fetchedEvents = snapshot.docs.map(doc => ({
                            ...(doc.data() as AppEvent),
                            id: doc.id
                        }));
                        setEvents(fetchedEvents);
                    }, (err) => {
                        setError(err.message);
                    });

                    // Cleanup function
                    return () => unsubscribe();
                }
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unexpected error occurred');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvents();
    }, [searchTerm, categoryFilter, ageGroupFilter, selectedMonth, cityFilter, page, isDateSearch, signedInUserInfo?.isAdmin]);

    return { events, isLoading, error };
};

export default useStreamEvents;

// import { useEffect, useState } from 'react';
// import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
// import { db } from '../services/firebase';
// import { UserInfo } from '../types/User.types';
// import useAuth from './useAuth';

// const useStreamUsers = () => {
//     const [users, setUsers] = useState<UserInfo[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState('');
//     const { signedInUserInfo } = useAuth();

//     useEffect(() => {
//         const usersCol = collection(db, 'users');

//         let q;
//         if (signedInUserInfo?.isAdmin) {
//             q = query(usersCol, orderBy('createdAt', 'asc'));
//         } else {
//             // You might want to modify this query according to your application's logic
//             // For example, you might want to fetch only the current user's data
//             q = query(usersCol, where('uid', '==', signedInUserInfo?.uid));
//         }

//         const unsubscribe = onSnapshot(
//             q,
//             (snapshot) => {
//                 const userData = snapshot.docs.map((doc) => ({ ...(doc.data() as UserInfo), id: doc.id }));
//                 setUsers(userData);
//                 setIsLoading(false);
//                 // setIsLoading(false);
//             },
//             (err) => {
//                 setError(err.message);
//                 setIsLoading(false);
//             }
//         );

//         return () => unsubscribe();
//     }, [signedInUserInfo?.isAdmin, signedInUserInfo?.uid]);

//     return { users, isLoading, error };
// };

// export default useStreamUsers;
