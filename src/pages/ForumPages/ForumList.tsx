import React, { useEffect, useState } from 'react';
import { db, forumsCol } from '../../services/firebase';
import { getDocs, collection } from 'firebase/firestore';
import { Forum } from '../../types/Forum.types';
import { NavLink } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, CircularProgress, Box, Button, Tooltip, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { deleteDoc, doc } from 'firebase/firestore';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Delete, Edit } from '@mui/icons-material';
import useLastPosts from '../../hooks/useLastPost';
import { getRelativeTime } from '../../helpers/getRelativeTime';

const ForumList: React.FC = () => {
    const theme = useTheme();
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const { signedInUserInfo } = useAuth();
    const navigate = useNavigate();
    const [forumDetails, setForumDetails] = useState<Record<string, { topicCount: number; lastUpdated: string }>>({});
    const lastPostsDetails = useLastPosts(forums);

    useEffect(() => {
        const fetchForums = async () => {
            setLoading(true);
            const newForumDetails = {};

            try {
                const forumSnapshot = await getDocs(forumsCol);
                const forumFetchPromises = forumSnapshot.docs.map(async (doc) => {
                    const forumData = doc.data() as Forum;
                    const forumId = doc.id;
                    const topicsSnapshot = await getDocs(collection(db, 'forums', forumId, 'topics'));

                    // Set the topic count and last updated information
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    newForumDetails[forumId] = {
                        topicCount: topicsSnapshot.size, // Total number of topics
                        lastUpdated: topicsSnapshot.docs[0]?.data()?.createdAt.toDate().toLocaleString() || 'Never'
                    };

                    return { ...forumData, id: forumId };
                });

                // Wait for all forums and their topics to be fetched
                const forumsList = await Promise.all(forumFetchPromises);
                setForumDetails(newForumDetails);
                setForums(forumsList);
            } catch (error) {
                console.error('Error fetching forums:', error);
            }

            setLoading(false);
        };

        fetchForums();
    }, []);

    const handleCreateForum = async () => {
        navigate('/forums/create-forum'); // Adjust the path as needed
    };

    const handleEditForum = async (forumId: string) => {
        navigate(`/forums/edit-forum/${forumId}`); // Adjust the path as needed
    };
    const handleDeleteForum = async (forumId: string) => {
        if (window.confirm('Are you sure you want to delete this forum?')) {
            try {
                await deleteDoc(doc(db, 'forums', forumId));
              
                setForums(forums.filter(forum => forum.id !== forumId));
    
               
                const updatedForumDetails = { ...forumDetails };
                delete updatedForumDetails[forumId];
                setForumDetails(updatedForumDetails);
            } catch (error) {
                console.error('Error deleting forum:', error);
            }
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>
            <Box padding={2} sx={{ maxWidth: '1200px' }}>
                <Typography variant="h2" align="center" gutterBottom>
                    Forums
                </Typography>
                {signedInUserInfo?.isAdmin && (
                    <Box display="flex" justifyContent="flex-start" mb={2}>
                        <Button variant="contained" color="primary" onClick={handleCreateForum}>
                            Create New Forum
                        </Button>
                    </Box>
                )}
                <Grid container spacing={2} justifyContent="center">
                    {forums.map((forum) => (
                        <Grid item xs={12} sm={6} md={4} key={forum.id}>
                            <Card variant="outlined" sx={{ minHeight: '200px', position: 'relative' }}>
                                <CardContent>
                                    <NavLink to={`/forums/${forum.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <Typography variant="h5" gutterBottom>
                                            {forum.title}
                                        </Typography>
                                        <Typography variant="body2">{forum.description}</Typography>
                                    </NavLink>
                                </CardContent>
                                <Box sx={{ position: 'absolute', bottom: 8, left: 16 }}>
                                    <Typography variant="body2">Topics: {forumDetails[forum.id]?.topicCount || 0}</Typography>
                                    <Typography variant="body2">Last Updated: {getRelativeTime(lastPostsDetails[forum.id])}</Typography>
                                </Box>
                                {signedInUserInfo?.isAdmin && (
                                    <>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleEditForum(forum.id);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 40,
                                                    color: theme.palette.primary.main
                                                }}
                                            >
                                                <Edit />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleDeleteForum(forum.id);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    color: theme.palette.error.main
                                                }}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
};

export default ForumList;
