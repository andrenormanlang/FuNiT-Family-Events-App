import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Event } from '../../types/Event.types';
import { Box, Grid, Card, CardContent, CardMedia, Typography, CircularProgress, Alert, Button } from '@mui/material';
import defaultImage from '../../assets/images/default-image.webp';
import useAuth from '../../hooks/useAuth';
// import { SavedEvent } from '../../types/SavedEvent.types';
import { auth } from '../../services/firebase';
import { useSavedEvents } from '../../contexts/SavedEventsProvider';

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

const eventData = (event: Event) => {
    return {
        id: event.id,
        address: event.address,
        ageGroup: event.ageGroup,
        category: event.category,
        eventDateTime: event.eventDateTime, // Make sure to handle Timestamp conversion if necessary
        // eventDateStart: event.eventDateStart, // Make sure to handle Timestamp conversion if necessary
        // eventDateEnd: event.eventDateEnd, // Make sure to handle Timestamp conversion if necessary
        description: event.description,
        email: event.email ?? null, // Replace undefined with null
        isApproved: event.isApproved ?? null,
        imageUrl: event.imageUrl,
        name: event.name,
        website: event.website ?? null // Replace undefined with null
    };
};

const EventPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState<Event | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const { signedInUser } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const { updateSavedEventsCount } = useSavedEvents();

    if (!id) {
        ('No id found in URL parameters.');
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
                        `No such document with id: ${id}`;
                    }
                } catch (err) {
                    setError('An error occurred while fetching the event.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        const checkIfEventIsSaved = async () => {
           
            const currentUser = auth.currentUser;
            if (currentUser && id) {
                const savedEventRef = doc(db, 'savedEvents', `${currentUser.uid}_${id}`);
                const docSnap = await getDoc(savedEventRef);
                setIsSaved(docSnap.exists());
            }
        };
    

        fetchEvent();
        checkIfEventIsSaved();
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
        ('Save Event button clicked');

        // Get the current user from Firebase Auth
        const user = auth.currentUser;

        // Check if a user is signed in and an event is selected
        if (user && event && event.id) {
            // Generate a unique ID for the saved event
            const savedEventRef = doc(db, 'savedEvents', `${user.uid}_${event.id}`);

            // Check if the event has already been saved by this user
            const docSnap = await getDoc(savedEventRef);

            if (docSnap.exists()) {
                // If the event is already saved, remove it
                await deleteDoc(savedEventRef);
                ('Event unsaved successfully');
            } else {
                // If the event hasn't been saved by this user, save it
                const newSavedEvent = {
                    userId: user.uid,
                    eventId: event.id,
                    eventData: eventData(event)
                };
                await setDoc(savedEventRef, newSavedEvent);
                ('Event saved successfully');
            }

            // Toggle the isSaved state
            setIsSaved(!isSaved);

            // Update the saved events count in the context
            updateSavedEventsCount();
        } else {
            ('User not signed in or event data missing');
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

   event;
     event.id;
    auth.currentUser;
     event;

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

