import { useEffect, useState } from 'react';
import { CollectionReference, QueryConstraint, onSnapshot, query } from 'firebase/firestore';

const useStreamCollection = <T>(
  colRef: CollectionReference<T>,
  queryConstraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const q = query(colRef, ...queryConstraints);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as T));

      setData(docsData);
      setIsLoading(false);
    }, (err) => {
      setError(err.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [colRef, queryConstraints]);

  return { data, isLoading, error };
};

export default useStreamCollection;
