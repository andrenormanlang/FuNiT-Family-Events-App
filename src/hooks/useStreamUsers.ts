import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { UserInfo } from '../types/User.types';
import useAuth from './useAuth'

const useStreamUsers = () => {
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { signedInUserInfo } = useAuth();

    useEffect(() => {
        const usersCol = collection(db, 'users');

        let q;
        if (signedInUserInfo?.isAdmin) {
            q = query(usersCol, orderBy('createdAt', 'asc'));
        } else {
            // You might want to modify this query according to your application's logic
            // For example, you might want to fetch only the current user's data
            q = query(usersCol, where('uid', '==', signedInUserInfo?.uid));
        }

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const userData = snapshot.docs.map((doc) => ({ ...(doc.data() as UserInfo), id: doc.id }));
                setUsers(userData);
                setIsLoading(false);
                // setIsLoading(false);
            },
            (err) => {
                setError(err.message);
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [signedInUserInfo?.isAdmin, signedInUserInfo?.uid]);

    return { users, isLoading, error };
};

export default useStreamUsers;

