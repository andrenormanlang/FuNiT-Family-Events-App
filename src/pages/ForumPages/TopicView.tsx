import { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getDocs } from 'firebase/firestore';
import { postsCol } from '../../services/firebase';
import { Post } from '../../types/Forum.types';
import useAuth from '../../hooks/useAuth';
import { Button } from '@mui/material';

const TopicView = () => {
  const { forumId, topicId } = useParams<{ forumId?: string; topicId?: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { signedInUser } = useAuth();

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
        <NavLink to={`/forums/${forumId}`}>Back to Topics</NavLink>
        {signedInUser && (
            <NavLink to={`/forums/${forumId}/topics/${topicId}/create-post`}>
                <Button variant="contained" color="primary" style={{ margin: '10px 0' }}>
                    Create New Post
                </Button>
            </NavLink>
        )}
        {posts.map((post) => (
            // Existing post display code
            <div key={post.id}>
                <NavLink to={`/forums/${forumId}/${post.id}`}>
                    <h2>{post.title}</h2>
                    <p>{post.content}</p>
                </NavLink>
            </div>
        ))}
    </div>
  );
};

export default TopicView;