import { useEffect, useState } from 'react';
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

// Create an index instance
const index = searchClient.initIndex('events_index');

interface Hit {
  objectID: string;
  category?: string;
  ageGroup?: string;
  address?: string;
  name?: string;
  eventDateTime?: number;
}

const convertUnixToDate = (unixTimestamp: number): string => {
  const date = new Date(unixTimestamp);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const useStreamEvents = ({
  searchTerm = '',
  categoryFilter = '',
  ageGroupFilter = '',
  selectedMonth = '',
  cityFilter = '',
  page = 1,
  isDateSearch = false,
} = {}) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { signedInUserInfo } = useAuth();

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        let queryResults;
        if (searchTerm) {
          if (isDateSearch) {
            const timestamp = new Date(searchTerm).getTime();
            if (isNaN(timestamp)) {
              throw new Error("Invalid date format");
            }
            queryResults = await index.search<Hit>('', {
              numericFilters: [`eventDateTime >= ${timestamp}`, `eventDateTime <= ${timestamp + 86400000}`],
            });
          } else {
            queryResults = await index.search<Hit>(searchTerm);
          }

          const transformedHits = queryResults.hits.map((hit: Hit) => ({
            id: hit.objectID,
            name: hit.name || '',
            category: hit.category as Category || 'Other',
            address: hit.address || '',
            ageGroup: hit.ageGroup || '',
            eventDateTime: hit.eventDateTime ? convertUnixToDate(hit.eventDateTime) : '',
          }));

          setEvents(transformedHits);
        } else {
          let q = query(collection(db, 'events'));

          if (signedInUserInfo?.isAdmin) {
            q = query(q, orderBy('eventDateTime', 'asc'));
          } else {
            q = query(q, where('isApproved', '==', true), orderBy('eventDateTime', 'asc'));
          }

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

          const unsubscribe = onSnapshot(q, (snapshot) => {
            const allEvents: AppEvent[] = snapshot.docs.map((doc) => ({
              ...(doc.data() as AppEvent),
              id: doc.id,
            }));

            setEvents(allEvents);
          });

          return () => {
            if (unsubscribe) {
              unsubscribe();
            }
          };
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
  }, [signedInUserInfo?.isAdmin, signedInUserInfo?.uid, categoryFilter, searchTerm, ageGroupFilter, selectedMonth, cityFilter, page, isDateSearch]);

  return { events, isLoading, error };
};

export default useStreamEvents;
