/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppEvent, Category } from '../types/Event.types';
import useAuth from './useAuth';
import algoliasearch from 'algoliasearch/lite';
import { formatDate } from '../helpers/FormatDate';


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
  imageUrl?: string
  eventDateTime?: Timestamp | string | null;
}

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
        
        if (searchTerm) {
          let queryResults;
          if (isDateSearch) {
            const date = new Date(searchTerm);
date.setUTCHours(0, 0, 0, 0); // Set to the start of the day in UTC
const startOfDayTimestamp = Math.floor(date.getTime() / 1000); // Convert to seconds

date.setUTCHours(23, 59, 59, 999); // Set to the end of the day in UTC
const endOfDayTimestamp = Math.floor(date.getTime() / 1000); // Convert to seconds

// Now use these timestamps to filter your search in Algolia
queryResults = await index.search<Hit>('', {
  numericFilters: [
    `eventDateTime._seconds >= ${startOfDayTimestamp}`,
    `eventDateTime._seconds <= ${endOfDayTimestamp}`
  ],
});
          } else {
            queryResults = await index.search<Hit>(searchTerm);
          }
        
          // Transform hits to include readable date format
          const transformedHits = queryResults?.hits.map((hit: Hit) => {
            let formattedDateString = '';
  if (hit.eventDateTime && typeof hit.eventDateTime === 'object' && '_seconds' in hit.eventDateTime)  {
    // @ts-expect-error
    const eventDate = new Date(hit.eventDateTime._seconds * 1000);
    const { date, time } = formatDate(eventDate);
    formattedDateString = `${date} ${time}`;
  } else if (typeof hit.eventDateTime === 'string') {
    const eventDate = new Date(hit.eventDateTime);
    const { date, time } = formatDate(eventDate);
    formattedDateString = `${date} ${time}`;
  } else {
    formattedDateString = 'Unknown Date';
  }
        
            return {
              id: hit.objectID,
              name: hit.name || '',
              category: hit.category as Category || 'Other',
              address: hit.address || '',
              ageGroup: hit.ageGroup || '',
              eventDateTime: formattedDateString,
              imageUrl: hit.imageUrl || '',
            };
          });
        
          setEvents(transformedHits || []);
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
            unsubscribe();
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
