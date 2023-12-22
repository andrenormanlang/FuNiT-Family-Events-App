import {  useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {  doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Event } from '../../types/Event.types';
import { Box, Grid, Card, CardContent, CardMedia, Typography, CircularProgress, Alert, Button } from '@mui/material';
import defaultImage from '../../assets/images/default-image.webp';
import useAuth from '../../hooks/useAuth';
import { getAuth } from 'firebase/auth';
import { SavedEvent } from '../../types/SavedEvent.types';
import { auth } from '../../services/firebase';

const formatDateTime = (date: Date): string => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    // Format the hours and minutes
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day} ${month} ${year} ${hours}:${minutes}`;
};



const EventPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { signedInUser } = useAuth();
    const [isSaved, setIsSaved] = useState(false);

    if (!id) {
        console.log('No id found in URL parameters.');
    }

    useEffect(() => {
        const fetchEvent = async () => {
          if (id) {
            setIsLoading(true);
            try {
              const docRef = doc(db, 'events', id);
              const docSnap = await getDoc(docRef);
      
              if (docSnap.exists()) {
                // Combine the document ID with the document's data into one object
                const eventData = { id: docSnap.id, ...docSnap.data() } as Event;
                setEvent(eventData);
              } else {
                setError('No such document!');
                console.log(`No such document with id: ${id}`);
              }
            } catch (err) {
              setError('An error occurred while fetching the event.');
              console.error(err);
            } finally {
              setIsLoading(false);
            }
          }
        };
      
        fetchEvent();
      }, [id]);


    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!event) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <Alert severity="warning">No such event!</Alert>
            </Box>
        );
    }


    const handleSaveClick = async () => {
        console.log('Save Event button clicked');
    
        const auth = getAuth();
        const user = auth.currentUser;
    
        if (user && event && event.id ) {
            const savedEventId = `${user.uid}_${event.id}`; // Unique identifier
            const savedEvent: SavedEvent = {
                id: savedEventId,
                eventId: event.id, // ID of the event being saved
                userId: user.uid // ID of the user who saved the event
            };
    
            try {
                const docRef = doc(db, 'savedEvents', savedEventId); // Create a DocumentReference
                await setDoc(docRef, savedEvent); // Use the DocumentReference
                setIsSaved(true);
                alert('Event saved successfully!');
                console.log('Document written with ID: ', docRef.id);
                console.log('setIsSaved state updated:', savedEvent);
            } catch (err) {
                console.error('Error adding document: ', err);
            }
        }
    };
    
    let formattedDateTime = '';
    if (event && event.eventDateTime) {
        const dateTime = event.eventDateTime.toDate(); // Convert to JavaScript Date object if necessary
        formattedDateTime = formatDateTime(dateTime);
    }

    const handleLocationClick = () => {
        const locationUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.address)}`;
        window.open(locationUrl, '_blank');
    };

    // Function to handle website click
    const handleWebsiteClick = () => {
        window.open(event.website, '_blank');
    };

    // Function to handle email click
    const handleEmailClick = () => {
        window.open(`mailto:${event.email}`);
    };


    const handleGoBack = () => {
        navigate('/'); // Navigate to the homepage
    };

    console.log('event:', event);
    console.log('event.id:', event.id);
    console.log('auth.currentUser:', auth.currentUser);
    console.log('event:', event)
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ maxWidth: 1000, width: '100%', p: 2 }}>
                <Box sx={{ mb: 4, display: 'flex', justifyContent: 'start' }}>
                    <Button
                        variant="contained"
                        onClick={handleGoBack}
                        sx={{ backgroundColor: 'secondary.main', color: 'white' }} // Apply a unique color
                    >
                        Go Back
                    </Button>
                </Box>
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardMedia
                                component="img"
                                height="250"
                                image={event.imageUrl || defaultImage}
                                alt={event.name}
                                sx={{ objectFit: 'cover', width: '100%' }}
                            />
                            <CardContent>
                                <Typography variant="h4" gutterBottom>
                                    {event.name}
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    {event.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Date & Time
                                </Typography>
                                <Typography variant="body1">{formattedDateTime}</Typography>

                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Location
                                </Typography>
                                <Typography variant="body1" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={handleLocationClick}>
                                    {event.address}
                                </Typography>
                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Email
                                </Typography>
                                <Typography variant="body2" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={handleEmailClick}>
                                    {event.email || 'N/A'}
                                </Typography>

                                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                                    Website
                                </Typography>
                                <Typography variant="body2" style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={handleWebsiteClick}>
                                    {event.website || 'N/A'}
                                </Typography>
                            </CardContent>
                            {signedInUser && (
                                <Button variant="contained" color="primary" className="w-auto" sx={{ ml: 2, mb: 2 }} onClick={handleSaveClick}>
                                    {isSaved ? 'Unsave Event' : 'Save Event'}
                                </Button>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};

export default EventPage;
