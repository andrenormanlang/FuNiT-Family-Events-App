import React, { useEffect, useState } from 'react';
import { forumsCol } from '../../services/firebase';
import { getDocs } from 'firebase/firestore';
import { Forum } from '../../types/Forum.types';
import { NavLink } from 'react-router-dom';
import { Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ForumList: React.FC = () => {
    const theme = useTheme();
    const [forums, setForums] = useState<Forum[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchForums = async () => {
            setLoading(true);
            try {
                const forumSnapshot = await getDocs(forumsCol);
                const forumsList = forumSnapshot.docs.map((doc) => {
                    const data = doc.data() as Forum;
                    return { ...data, id: doc.id };
                });
                setForums(forumsList);
            } catch (error) {
                console.error('Error fetching forums:', error);
            }
            setLoading(false);
        };

        fetchForums();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box display="flex" flexDirection="column" alignItems="center" marginTop={1} marginBottom={theme.spacing(4)}>

        <Box padding={2} sx={{maxWidth: '1200px'}}>
            <Typography variant="h2" align="center" gutterBottom>Forums</Typography>
            <Grid container spacing={2} justifyContent="center">
                {forums.map((forum) => (
                    <Grid item xs={12} sm={6} md={4} key={forum.id}>
                        <Card variant="outlined" sx={{ minHeight: 150 }}>
                            <CardContent>
                                <NavLink to={`/forums/${forum.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <Typography variant="h5" gutterBottom>{forum.title}</Typography>
                                    <Typography variant="body2">{forum.description}</Typography>
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

export default ForumList;