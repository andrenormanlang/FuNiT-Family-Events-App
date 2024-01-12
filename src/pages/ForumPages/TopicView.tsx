import { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { getDocs, doc as firestoreDoc, getDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, postsCol, topicsCol, usersCol } from '../../services/firebase';
import { Post, PostWithUserInfo } from '../../types/Forum.types';
import { Box, Typography, Avatar, CircularProgress, Button, Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { UserInfo } from '../../types/User.types';
import useAuth from '../../hooks/useAuth';
import { format } from 'date-fns';
import { Delete } from '@mui/icons-material';

const TopicView = () => {
    const theme = useTheme();
    const { forumId, topicId } = useParams<{ forumId?: string; topicId?: string }>();
    const [postsWithUserInfo, setPostsWithUserInfo] = useState<PostWithUserInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const { signedInUser } = useAuth();
    const [topicTitle, setTopicTitle] = useState('');
    const { signedInUserInfo } = useAuth();

    useEffect(() => {
        const fetchPostsAndUsers = async () => {
            setLoading(true);

            try {
                // Fetch posts
                const postsSnapshot = await getDocs(postsCol(forumId!, topicId!));
                const posts = postsSnapshot.docs
                    .map((doc) => ({ ...(doc.data() as Post), id: doc.id })) // Map to Post objects with ids
                    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()); // Sort by createdAt in descending order

                // Fetch user info for each post
                const postsWithUserPromises = posts.map(async (postData) => {
                    const userSnapshot = await getDoc(firestoreDoc(usersCol, postData.authorId));
                    const userData = userSnapshot.data() as UserInfo;
                    return { ...postData, author: userData }; // Combine post with user info
                });

                // Wait for all user info to be fetched and set state
                const postsWithUserInfo = await Promise.all(postsWithUserPromises);
                setPostsWithUserInfo(postsWithUserInfo);
            } catch (error) {
                console.error('Error fetching posts or user info:', error);
            }

            setLoading(false);
        };

        if (forumId && topicId) {
            fetchPostsAndUsers();
        }
    }, [forumId, topicId]);

    useEffect(() => {
        const fetchTopicAndPosts = async () => {
            if (typeof forumId === 'undefined' || typeof topicId === 'undefined') {
                // Handle the case where forumId or topicId is not provided in the URL
                console.error('forumId or topicId is undefined');
                return;
            }
            setLoading(true);

            try {
                // Assume you have a topicsCol similar to postsCol
                const topicRef = doc(topicsCol(forumId), topicId);
                const topicSnapshot = await getDoc(topicRef);
                if (topicSnapshot.exists()) {
                    const topicData = topicSnapshot.data();
                    setTopicTitle(topicData.title); // Set the topic title here
                } else {
                    console.error('Topic not found');
                }

                // Fetch posts and their user info (as you have in your current useEffect)
                // ...
            } catch (error) {
                console.error('Error fetching topic or posts:', error);
            }

            setLoading(false);
        };

        if (forumId && topicId) {
            fetchTopicAndPosts();
        }
    }, [forumId, topicId]);

    const handleDeletePost = async (postId: string) => {
        if (!signedInUserInfo?.isAdmin) {
            alert('You are not authorized to perform this action.');
            return;
        }

        const confirmDelete = window.confirm('Are you sure you want to delete this post?');
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, `forums/${forumId}/topics/${topicId}/posts`, postId));
                setPostsWithUserInfo((prevPosts) => prevPosts.filter((post) => post.id !== postId));
                alert('Post deleted successfully.');
            } catch (error) {
                console.error('Error deleting post:', error);
                alert('Failed to delete post.');
            }
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ my: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
                {topicTitle}
            </Typography>
            {/* Use the same maxWidth as your EventGrid for consistency */}
            {!postsWithUserInfo.length ? (
                <Box>
                    <Typography variant="h6" align="center" sx={{ mt: 2 }}>
                        No posts in this topic yet. Be the first to create one!
                    </Typography>
                    <Box mt={4} display="flex" justifyContent="center">
                        <NavLink to={`/forums/${forumId}`} style={{ textDecoration: 'none', marginRight: theme.spacing(2) }}>
                            <Button variant="contained" color="primary">
                                Back to All Topics
                            </Button>
                        </NavLink>
                        {signedInUser && (
                            <NavLink to={`/forums/${forumId}/topics/${topicId}/create-post`} style={{ textDecoration: 'none' }}>
                                <Button variant="contained" color="secondary">
                                    Create New Post
                                </Button>
                            </NavLink>
                        )}
                    </Box>
                </Box>
            ) : (
                <>
                    <Box display="flex" flexDirection="column" alignItems=""></Box>
                    <Box display="flex" flexDirection="column" alignItems="" marginTop={1} marginBottom={theme.spacing(4)}>
                        <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
                            <Box pr={2}>
                                {' '}
                                {/* Apply padding to the right */}
                                <NavLink to={`/forums/${forumId}`} style={{ textDecoration: 'none' }}>
                                    <Button variant="contained" color="primary">
                                        Back to All Topics
                                    </Button>
                                </NavLink>
                            </Box>
                            {signedInUser && (
                                <NavLink to={`/forums/${forumId}/topics/${topicId}/create-post`} style={{ textDecoration: 'none' }}>
                                    <Button variant="contained" color="secondary">
                                        Create New Post
                                    </Button>
                                </NavLink>
                            )}
                        </Box>
                        {postsWithUserInfo.map((post) => (
                            <Box
                                key={post.id}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    maxWidth: '1200px',
                                    my: 2,
                                    border: 1, // Adjust this value for border size
                                    borderColor: 'grey.300', // You can choose any color from the theme
                                    borderRadius: '8px', // Adjust this value for border radius
                                    overflow: 'hidden', // This ensures that content does not spill outside the border radius
                                    boxShadow: 3
                                }}
                            >
                                <Box
                                    sx={{
                                        width: '20%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'flex-start',
                                        padding: theme.spacing(2),
                                        backgroundColor: '#f4f4f4',
                                        maxWidth: '120px'
                                    }}
                                >
                                    <Avatar sx={{ width: theme.spacing(7), height: theme.spacing(7) }} src={post.author.photoURL} />
                                    <Typography variant="subtitle2">{post.author.displayName}</Typography>

                                    <Typography variant="body2" color={post.author.isAdmin ? 'secondary' : 'textPrimary'}>
                                        {post.author.isAdmin ? 'Admin' : 'Member'}
                                    </Typography>
                                </Box>
                                <Box sx={{ flexGrow: 1, p: 2, backgroundColor: '#fff', width: '100%' }}>
                                    <Typography variant="body2" color="textSecondary">
                                        {format(new Date(post.createdAt.toMillis()), 'PPpp')}
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                        {post.title}
                                    </Typography>
                                    <Typography variant="body1" mt={2} mb={2}>
                                        {post.content}
                                    </Typography>
                                    {post.imageUrl && (
                                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 2 }}>
                                            <img
                                                src={post.imageUrl}
                                                alt="Post"
                                                style={{
                                                    maxWidth: '100%',
                                                    width: 'auto',
                                                    maxHeight: '300px',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px'
                                                }}
                                            />
                                        </Box>
                                    )}
                                    {signedInUserInfo?.isAdmin && (
                                        <Button onClick={() => handleDeletePost(post.id)} color="error">
                                            <Delete />
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </>
            )}
        </Container>
    );
};

export default TopicView;
