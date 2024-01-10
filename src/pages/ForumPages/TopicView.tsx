import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDocs } from 'firebase/firestore';
import { postsCol } from '../../services/firebase';
import { Post } from '../../types/Forum.types';

const TopicView = () => {
  const { forumId, topicId } = useParams<{ forumId?: string; topicId?: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (forumId && topicId) {
      const fetchPosts = async () => {
        try {
          const postsQuery = postsCol(forumId, topicId);
          const querySnapshot = await getDocs(postsQuery);
          const fetchedPosts: Post[] = querySnapshot.docs.map((doc) => {
            const postData = doc.data() as Omit<Post, 'id'>;
            return {
              id: doc.id, // Ensures the Firestore document ID is used
              ...postData, // Spread the remaining post data
            };
          });
          setPosts(fetchedPosts);
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
        setLoading(false);
      };

      fetchPosts();
    }
  }, [forumId, topicId]);

  if (!forumId || !topicId) {
    return <div>Invalid forum or topic ID.</div>;
  }

  if (loading) {
    return <div>Loading posts...</div>;
  }

  return (
    <div>
      {posts.map((post) => (
        <div key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          {/* Additional post details */}
        </div>
      ))}
    </div>
  );
};

export default TopicView;