import  { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getDocs, doc, getDoc } from 'firebase/firestore';
import { postsCol, topicsCol } from '../../services/firebase';
import { Post, Topic } from '../../types/Forum.types';
import useAuth from '../../hooks/useAuth';
import { Button, Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const TopicView = () => {
  const theme = useTheme();
  const { forumId, topicId } = useParams<{ forumId?: string; topicId?: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const { signedInUser } = useAuth();

  useEffect(() => {
    const fetchTopicAndPosts = async () => {
      if (forumId && topicId) {
        setLoading(true);
        try {
          // Fetching the topic details
          const topicRef = doc(topicsCol(forumId), topicId);
          const topicSnap = await getDoc(topicRef);
          if (topicSnap.exists()) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            setTopic({ id: topicSnap.id, ...topicSnap.data() as Topic });
          }

          // Fetching posts within the topic
          const postsQuery = postsCol(forumId, topicId);
          const querySnapshot = await getDocs(postsQuery);
          const fetchedPosts: Post[] = querySnapshot.docs.map((doc) => ({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            id: doc.id,
            ...doc.data() as Post
          }));
          setPosts(fetchedPosts);
        } catch (error) {
          console.error('Error fetching topic or posts:', error);
        }
        setLoading(false);
      }
    };
    fetchTopicAndPosts();
  }, [forumId, topicId]);

  if (!forumId || !topicId) {
    return <div>Invalid forum or topic ID.</div>;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>
      <Box padding={2} sx={{ maxWidth: '1200px' }}>
        <Typography variant="h2" align="center" gutterBottom>{topic?.title}</Typography>
        <Typography variant="subtitle1" align="center" gutterBottom>{topic?.description}</Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12}>
            <NavLink to={`/forums/${forumId}`} style={{ textDecoration: 'none', marginBottom: '10px' }}>
              <Button variant="contained" color="primary" fullWidth>Back to Topics</Button>
            </NavLink>
          </Grid>
          {signedInUser && (
            <Grid item xs={12}>
              <NavLink to={`/forums/${forumId}/topics/${topicId}/create-post`} style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="secondary" fullWidth>Create New Post</Button>
              </NavLink>
            </Grid>
          )}
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card variant="outlined">
                <CardContent>
                  <NavLink to={`/forums/${forumId}/topics/${topicId}/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h5" gutterBottom>{post.title}</Typography>
                    <Typography variant="body2">{post.content}</Typography>
                  </NavLink>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default TopicView;
