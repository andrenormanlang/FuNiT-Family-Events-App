import  { useEffect, useState } from 'react';
import { forumsCol, topicsCol } from '../../services/firebase';
import { getDoc, getDocs, doc } from 'firebase/firestore';
import { Topic, Forum } from '../../types/Forum.types';
import { NavLink, useParams } from 'react-router-dom';
import { Button, Card, CardContent, Typography, Grid, Box } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '@mui/material/styles';

const TopicList = () => {
    const theme = useTheme();
    const { forumId } = useParams<{ forumId?: string }>();
    const [forum, setForum] = useState<Forum | null>(null);
    const [topics, setTopics] = useState<Topic[]>([]);

    const { signedInUser } = useAuth();

    useEffect(() => {
        if (forumId) {
            // Fetch forum details
            const fetchForum = async () => {
                const forumDoc = await getDoc(doc(forumsCol, forumId));
                if (forumDoc.exists()) {
                    const forumData = forumDoc.data() as Forum;
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    setForum({ id: forumDoc.id, ...forumData });
                } else {
                    console.error('Forum not found');
                }
            };
    
            // Fetch topics
            const fetchTopics = async () => {
                const topicsQuery = topicsCol(forumId);
                const querySnapshot = await getDocs(topicsQuery);
                const fetchedTopics: Topic[] = querySnapshot.docs.map((docSnapshot) => {
                    const topicData = docSnapshot.data() as Topic;
                    return { ...topicData, id: docSnapshot.id }; // Explicitly setting the id here
                });
                setTopics(fetchedTopics);
            };
    
            fetchForum();
            fetchTopics();
        }
    }, [forumId]);
    
    

    if (!forumId || !forum) {
        return <div>Please select a forum to view topics.</div>;
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>
        <Box padding={2} sx={{maxWidth: '1200px'}}>
            <Typography variant="h2" align="center" gutterBottom>{forum.title}</Typography>
            <Typography variant="subtitle1" align="center" gutterBottom>{forum.description}</Typography>
            <Grid container spacing={2} justifyContent="center">
                <Grid item xs={12}>
                    <NavLink to="/forums" style={{ textDecoration: 'none' }}>
                        <Button variant="contained" color="primary" fullWidth style={{ marginBottom: '10px' }}>
                            Back to All Forums
                        </Button>
                    </NavLink>
                </Grid>
                {signedInUser && (
                    <Grid item xs={12}>
                        <NavLink to={`/forums/${forumId}/create-topic`} style={{ textDecoration: 'none' }}>
                            <Button variant="contained" color="secondary" fullWidth style={{ marginBottom: '10px' }}>
                                Create New Topic
                            </Button>
                        </NavLink>
                    </Grid>
                )}
                {topics.map((topic) => (
                    <Grid item xs={12} sm={6} md={4} key={topic.id}>
                        <Card variant="outlined">
                            <CardContent>
                                <NavLink to={`/forums/${forumId}/topics/${topic.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Typography variant="h5" gutterBottom>{topic.title}</Typography>
                                    <Typography variant="body2">{topic.description}</Typography>
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

export default TopicList;

