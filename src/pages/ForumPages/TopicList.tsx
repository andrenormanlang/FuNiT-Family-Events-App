import { useEffect, useState } from 'react';
import { topicsCol } from '../../services/firebase';
import { getDocs } from 'firebase/firestore';
import { Topic } from '../../types/Forum.types';
import { useParams } from 'react-router-dom';

const TopicList = () => {
    const { forumId } = useParams<{ forumId?: string }>(); // Note the forumId is optional
    const [topics, setTopics] = useState<Topic[]>([]);

    useEffect(() => {
        if (forumId) { // Only proceed if forumId is not undefined
            const fetchTopics = async () => {
                const topicsQuery = topicsCol(forumId);
                const querySnapshot = await getDocs(topicsQuery);
                const fetchedTopics: Topic[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data() as Topic;
                    return {
                        ...data,
                        id: doc.id
                    };
                });
                setTopics(fetchedTopics);
            };

            fetchTopics();
        }
    }, [forumId]);

    if (!forumId) {
        return <div>Please select a forum to view topics.</div>; // or any other error handling
    }

    return (
        <div>
            {topics.map((topic) => (
                <div key={topic.id}>
                    <h3>{topic.title}</h3>
                    <p>{topic.description}</p>
                    {/* Add link to topic detail page if needed */}
                </div>
            ))}
        </div>
    );
};

export default TopicList;