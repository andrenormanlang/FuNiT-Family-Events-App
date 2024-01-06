import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
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
    eventDateTime?: Timestamp;
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

                    const transformedHits = queryResults.hits.map((hit: Hit) => {
                        let formattedDate = ''; // Default empty string if the date is invalid or not provided
                        
                        if (hit.eventDateTime) {
                            const eventDate = hit.eventDateTime.toDate();
                          if ((eventDate.getTime())) {
                            // If eventDate is a valid date, format it
                            formattedDate = eventDate.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false,
                            });
                          }
                        }
                      
                        return {
                            id: hit.objectID,
                            name: hit.name || '',
                            category: hit.category as Category || 'Other',
                            address: hit.address || '',
                            ageGroup: hit.ageGroup || '',
                            eventDateTime: formattedDate,  // Use formattedDate here
                        };
                      });
                      
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

