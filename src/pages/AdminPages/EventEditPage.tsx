import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Timestamp, collection, doc, getDoc, getDocs, query, where, writeBatch } from 'firebase/firestore';
import { storage } from '../../services/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../services/firebase';
import { Category, Event } from '../../types/Event.types';
import useAuth from '../../hooks/useAuth';
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Alert,
    Grid,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Switch
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import PlacesAutocomplete from '../../helpers/PlacesAutoComplete'; // Import your PlacesAutocomplete component
import { useLoadScript } from '@react-google-maps/api';
import { FirebaseError } from 'firebase/app';

// Age Groups and Category values
const ageGroups = ['1-3 Years', '4-6 Years', '7-9 Years', '7-12 Years', '10-12 Years', 'All Ages'];
const categoryValues = [
    'Art, Film & Books',
    'Community Festivals',
    'Cooking',
    'DIY',
    'Educational Activities',
    'Games',
    'Health and Wellness',
    'Music',
    'Outdoor Activities',
    'Theatre & Dance',
    'Other'
];

const EventEditPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { signedInUserInfo } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [eventDate, setEventDate] = useState<Date | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [address, setAddress] = useState('');

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GEOCODE_API_KEY, // Ensure this is correct
        libraries: ['places']
    });

    useEffect(() => {
        if (!id || !signedInUserInfo?.isAdmin) {
            navigate('/404');
            return;
        }

        const fetchEvent = async () => {
            setIsLoading(true);
            try {
                const docRef = doc(db, 'events', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const eventData = { id: docSnap.id, ...docSnap.data() } as Event;
                    // console.log("Fetched address:", eventData.address);
                    setEvent(eventData);
                    setEventDate(eventData.eventDateTime.toDate());
                } else {
                    navigate('/404');
                }
            } catch (err) {
                setError('Error fetching event');
            } finally {
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [id, signedInUserInfo, navigate]);

    useEffect(() => {
        // Update address state when event data is fetched
        if (event) {
            setAddress(event.address);
        }
    }, [event]); // Dependency on event

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const file = e.target.files[0];
            if (!file) return;

            setIsLoading(true);
            const fileRef = ref(storage, 'events/' + file.name);
            await uploadBytes(fileRef, file);
            const newImageUrl = await getDownloadURL(fileRef);
            setEvent((prevEvent) => (prevEvent ? { ...prevEvent, imageUrl: newImageUrl } : null));
            setIsLoading(false);
        }
    };

    const handleAddressChange = (value: string) => {
        setAddress(value);
        setEvent((prevEvent) => (prevEvent ? { ...prevEvent, address: value } : null));
    };

    const handleEventSubmit = async () => {
        if (!event || !id || !eventDate) return;
    
        setIsLoading(true);
    
        try {
            const updatedEvent = {
                ...event,
                eventDateTime: Timestamp.fromDate(eventDate),
                updatedAt: Timestamp.fromDate(new Date()),
            };
    
            // Start a batch
            const batch = writeBatch(db);
    
            // Update the main event
            const eventRef = doc(db, 'events', id);
            batch.update(eventRef, updatedEvent);
    
            // Find and update all savedEvents that reference this event
            const q = query(collection(db, 'savedEvents'), where('eventId', '==', id));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((docSnapshot) => {
                const savedEventRef = docSnapshot.ref;
                batch.update(savedEventRef, { eventData: updatedEvent });
            });
    
            // Commit the batch
            await batch.commit();
    
            alert('Event updated successfully!');
            navigate('/');
        } catch (error) {
            if (error instanceof FirebaseError) {
                setError(error.message);
            } else {
                setError('An error occurred');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/'); // Navigates to the homepage
    };

    if (isLoading) return <CircularProgress />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!event) return <div>Loading event data...</div>; // Show loading state until event data is available
    if (!isLoaded) {
        return <div>Loading Addresses...</div>; // Display loading message until the script is loaded
    }

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ width: { xs: '80%', sm: '60%', md: '70%' }, margin: 'auto', p: 3 }}>
            
                <Grid container spacing={2} justifyContent="center">
                    <Grid item xs={12} md={6}>
                        <Card>
                            <CardContent>
                                <Typography variant="h4" gutterBottom>
                                    Edit Event
                                </Typography>
                                <Button onClick={handleGoBack} color="secondary" variant="contained" sx={{ mb: 2 }}>
        Go Back
    </Button>
                                {event && (
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            handleEventSubmit();
                                        }}>
                                        <TextField
                                            label="Name"
                                            value={event.name}
                                            onChange={(e) => setEvent({ ...event, name: e.target.value })}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <TextField
                                            label="Description"
                                            value={event.description}
                                            onChange={(e) => setEvent({ ...event, description: e.target.value })}
                                            fullWidth
                                            margin="normal"
                                            multiline
                                            rows={4}
                                        />
                                        {event.imageUrl && (
                                            <Box sx={{ mb: 2 }}>
                                                <img src={event.imageUrl} alt={event.name} style={{ maxWidth: '100%', height: 'auto' }} />
                                            </Box>
                                        )}
                                        <Box sx={{ mb: 2 }}>
                                            <input type="file" onChange={handleImageUpload} accept="image/*" />
                                        </Box>
                                        <DateTimePicker
                                            label="Event Date"
                                            value={eventDate}
                                            onChange={(newDate) => setEventDate(newDate)}
                                            sx={{ mb: 2 }}
                                            // renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                                        />
                                        <Typography variant="body1" gutterBottom sx={{ mb: 0 }}>
                                            Current Address: {event.address}
                                        </Typography>
                                        <PlacesAutocomplete
                                            value={address} 
                                            onChange={handleAddressChange} 
                                            error={!!error}
                                            helperText={error}
                                            selectedCity={''} 
                                        />
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Age Group</InputLabel>
                                            <Select
                                                value={event.ageGroup}
                                                label="Age Group"
                                                onChange={(e) => setEvent({ ...event, ageGroup: e.target.value as (typeof ageGroups)[number] })}>
                                                {ageGroups.map((ageGroup, index) => (
                                                    <MenuItem key={index} value={ageGroup}>
                                                        {ageGroup}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Category</InputLabel>
                                            <Select
                                                value={event.category || categoryValues[0]}
                                                label="Category"
                                                onChange={(e) => setEvent({ ...event, category: e.target.value as Category })}>
                                                {categoryValues.map((category, index) => (
                                                    <MenuItem key={index} value={category}>
                                                        {category}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                        <TextField
                                            label="Email"
                                            value={event.email}
                                            onChange={(e) => setEvent({ ...event, email: e.target.value })}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <TextField
                                            label="Website"
                                            value={event.website}
                                            onChange={(e) => setEvent({ ...event, website: e.target.value })}
                                            fullWidth
                                            margin="normal"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={event.isApproved}
                                                    onChange={(e) => setEvent({ ...event, isApproved: e.target.checked })}
                                                />
                                            }
                                            label="Approved"
                                        />
                                        <Typography variant="body1" gutterBottom>
                                            Created At: {event.createdAt.toDate().toLocaleString()}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                        Updated At: {event.updatedAt ? event.updatedAt.toDate().toLocaleString() : 'Never Updated'}
                                        </Typography>
                                        <Button type="submit" variant="contained" color="primary" disabled={isLoading} sx={{ mt: 2 }}>
                                            Update Event
                                        </Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </LocalizationProvider>
    );
};

export default EventEditPage;
