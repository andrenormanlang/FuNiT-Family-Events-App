import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Card, CardContent, Typography, Container, Grid } from '@mui/material';

const LogOutPage = () => {
    const { signOutUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const signOut = async () => {
            await signOutUser();
            navigate('/');
        };

        signOut();
    }, [signOutUser, navigate]);

    return (
        <Container className="py-3 flex justify-center">
            <Grid item xs={12} md={6} lg={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h5" className="mb-3">Sign Out</Typography>
                        <Typography>Please wait while you're being signed out...</Typography>
                    </CardContent>
                </Card>
            </Grid>
        </Container>
    );
};

export default LogOutPage;
