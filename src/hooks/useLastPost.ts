import { useState, useEffect } from 'react';
import { Forum } from '../types/Forum.types';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebase';

type LastPostsDetails = {
    [key: string]: Date | null; // Change this type according to what fetchLastPostForForum returns
};

const useLastPosts = (forums: Forum[]) => {
    const [lastPostsDetails, setLastPostsDetails] = useState<LastPostsDetails>({});

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const fetchLastPostForForum = async (forumId: string): Promise<Date | null> => {
            // Replace this logic with the actual query to your database
            const postsQuery = query(collection(db, 'forums', forumId, 'topics'), orderBy('createdAt', 'desc'), limit(1));
            const querySnapshot = await getDocs(postsQuery);
            if (!querySnapshot.empty) {
                const lastPost = querySnapshot.docs[0].data();
                // Assuming 'createdAt' is a Timestamp object, convert it to a Date
                return lastPost.createdAt.toDate();
            } else {
                return null; // Return null if there are no posts
            }
        };

        const fetchAndUpdateLastPosts = async () => {
            const promises = forums.map(async (forum) => {
                const lastPostDate = await fetchLastPostForForum(forum.id);
                return { forumId: forum.id, lastPostDate };
            });

            const lastPosts = await Promise.all(promises);
            const lastPostsMap = lastPosts.reduce<LastPostsDetails>((acc, { forumId, lastPostDate }) => {
                acc[forumId] = lastPostDate;
                return acc;
            }, {});

            setLastPostsDetails(lastPostsMap);
        };

        if (forums.length) {
            fetchAndUpdateLastPosts();
        }
    }, [forums]);

    return lastPostsDetails;
};

export default useLastPosts;
