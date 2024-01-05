import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { AppEvent, Category } from '../types/Event.types';
import useAuth from './useAuth';
import algoliasearch from 'algoliasearch/lite';

// Initialize Algolia search client
const searchClient = algoliasearch(
  import.meta.env.VITE_ALGOLIA_APP_ID,
  import.meta.env.VITE_ALGOLIA_SEARCH_ONLY_API_KEY,
);

interface Hit {
  objectID: string;
  category?: string;
  ageGroup?: string;
  address?: string;
  name?: string;
  eventDateTime?: number; // Assuming this comes as a string from Algolia
}

const useStreamEvents = ({
  searchTerm = '',
  categoryFilter = '',
  ageGroupFilter = '',
  selectedMonth = '',
  cityFilter = '',
  page = 1,
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
          const { hits } = await searchClient.initIndex('events_index').search<Hit>(searchTerm, {
            ...(categoryFilter && { facetFilters: [`category:${categoryFilter}`] }),
            ...(ageGroupFilter && { facetFilters: [`ageGroup:${ageGroupFilter}`] }),
          });

          const transformedHits: AppEvent[] = hits.map((hit) => ({
            id: hit.objectID,
            name: hit.name || '',
            category: hit.category as Category || 'Other',
            address: hit.address || '',
            ageGroup: hit.ageGroup || '',
            eventDateTime: hit.eventDateTime ? new Timestamp(hit.eventDateTime / 1000, 0) : undefined,
            // Add default values or transformations for other fields as needed
            // ...
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
  }, [signedInUserInfo?.isAdmin, signedInUserInfo?.uid, categoryFilter, searchTerm, ageGroupFilter, selectedMonth, cityFilter, page]);

  return { events, isLoading, error };
};

export default useStreamEvents;
