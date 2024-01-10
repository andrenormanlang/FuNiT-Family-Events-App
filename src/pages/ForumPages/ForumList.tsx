import React, { useEffect, useState } from 'react';
import { forumsCol } from '../../services/firebase';
import { getDocs } from 'firebase/firestore';
import { Forum } from '../../types/Forum.types';

const ForumList: React.FC = () => {
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchForums = async () => {
            setLoading(true);
            try {
                const forumSnapshot = await getDocs(forumsCol);
                const forumsList = forumSnapshot.docs.map((doc) => {
                    const data = doc.data() as Forum; // Cast the document data as a Forum type
                    return {
                        ...data,
                        id: doc.id // This assumes your documents don't have an 'id' field already
                    };
                });
                setForums(forumsList);
            } catch (error) {
                console.error('Error fetching forums: ', error);
            }
            setLoading(false);
        };

        fetchForums();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Forums</h1>
            <ul>
                {forums.map((forum) => (
                    <li key={forum.id}>
                        <h2>{forum.title}</h2>
                        <p>{forum.description}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ForumList;
