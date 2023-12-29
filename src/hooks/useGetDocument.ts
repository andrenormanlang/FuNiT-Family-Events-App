import { CollectionReference, doc, getDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

const useGetDocument = <T>(colRef: CollectionReference<T>, documentId: string) => {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);

    const getData = useCallback(async () => {
        setError(false);
        setLoading(true);

        console.log(`Fetching document with ID: ${documentId}`); // Log the document ID

        const docRef = doc(colRef, documentId);
        try {
            const docSnapshot = await getDoc(docRef);

            if (!docSnapshot.exists()) {
                console.log('Document does not exist.'); // Log when the document does not exist
                setData(null);
                setError(true);
                setLoading(false);
                return;
            }

            const data: T = {
                ...docSnapshot.data(),
                _id: docSnapshot.id
            };

            console.log('Document fetched:', data); // Log the fetched data
            setData(data);
        } catch (err) {
            console.error('Error fetching document:', err); // Log any errors that occur during fetch
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [colRef, documentId]);

    useEffect(() => {
        if (documentId) {
            getData();
        }
    }, [documentId, getData]);

    return {
        data,
        error,
        getData,
        loading
    };
};

export default useGetDocument;
