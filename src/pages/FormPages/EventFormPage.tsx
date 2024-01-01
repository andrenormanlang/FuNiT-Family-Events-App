import { useState } from 'react';
import { Timestamp, GeoPoint, doc, collection } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    FormHelperText,
    Grid,
    Card,
    CardContent,
    Container
} from '@mui/material';
import { DesktopDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import  { db, eventsCol, storage } from '../../services/firebase';
import { setDoc } from 'firebase/firestore';
import { Libraries, useLoadScript } from '@react-google-maps/api';
import PlacesAutocomplete from '../../helpers/PlacesAutoComplete';
import  AddressMap  from '../../helpers/AddressMap';
import { Event } from '../../types/Event.types';
import useAuth from '../../hooks/useAuth';
import { RemoveCircleOutline } from '@mui/icons-material';
import { geocodeByAddress, getLatLng } from 'react-places-autocomplete';


const libraries: Libraries = ['places'];

const ageGroups = [
    '1-3 Years', // Toddlers
    '4-6 Years', // Preschool to Early School Age
    '7-9 Years', // Mid School Age
    '7-12 Years', // Mid School Age
    '10-12 Years', // Preteens
    'All Ages'
] as const;

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
] as const;

interface MapCenter {
    lat: number;
    lng: number;
}

// Zod schema for event data validation
const eventSchema = z.object({
    name: z.string().min(3, 'Please enter the event name'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    eventDateTime: z.date(),
    address: z.string().min(1, 'Please enter an address'),
    // image: z.union([z.instanceof(File), z.null()]),
    ageGroup: z.enum(ageGroups),
    category: z.enum(categoryValues),
    email: z.union([z.string().email(), z.literal('')]).optional(),
    website: z.union([z.string().url(), z.literal('')]).optional(),

});

type EventData = z.infer<typeof eventSchema>;

const EventForm: React.FC = () => {
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
        reset
    } = useForm<EventData>({
        resolver: zodResolver(eventSchema)
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    // const [selectedCity, setSelectedCity] = useState('Copenhagen');

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: import.meta.env.VITE_GEOCODE_API_KEY,
        libraries
    });

    const { signedInUserInfo } = useAuth();
   

    const [mapCenter, setMapCenter] = useState<MapCenter | null>(null);

    if (!isLoaded) return <div>Loading...</div>;

    const onSubmit = async (data: EventData) => {
        setIsSubmitting(true);
        let imageUrl = '';
        let location;

        try {
            if (selectedImage) {
                const imageRef = ref(storage, `events/${selectedImage.name}`);
                const uploadResult = await uploadBytes(imageRef, selectedImage);
                imageUrl = await getDownloadURL(uploadResult.ref);
            }

            if (data.address) {
                const geocodeResults = await geocodeByAddress(data.address);
                const { lat, lng } = await getLatLng(geocodeResults[0]);
                location = new GeoPoint(lat, lng);
            }

            const eventDateTime = data.eventDateTime ? new Date(data.eventDateTime) : new Date();
            const docRef = doc(collection(db, 'events'));

            const eventData: Partial<Event> = {
                ...data,
                id: docRef.id,
                imageUrl,
                eventDateTime: Timestamp.fromDate(eventDateTime),
                isApproved: !!signedInUserInfo && !!signedInUserInfo.isAdmin,
                createdAt: Timestamp.now(),
                location
            };

            await setDoc(docRef, eventData);

            resetForm();
            alert('Event submitted successfully!');
        } catch (error) {
            console.error('Error submitting event:', error);
            alert('Error submitting event.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        reset();
        setSelectedImage(null);
        setImagePreviewUrl(null);
        setValue('name', '');
        setValue('description', '');
        setValue('eventDateTime', new Date());
        setValue('address', '');
        setValue('ageGroup', ageGroups[0]);
        setValue('category', categoryValues[0]);
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            event.target.files[0]; // Log the selected file
            setSelectedImage(event.target.files[0]);
            const imageUrl = URL.createObjectURL(event.target.files[0]);
            setImagePreviewUrl(imageUrl); // Store the image URL in state
        }
    };

    const handleDiscardImage = () => {
        setSelectedImage(null);
        setImagePreviewUrl(null);
        // Optionally, if you want to reset the file input as well
        const fileInput = document.getElementById('image') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    const handleAddressSelect = async (address: string) => {
        try {
            const results = await geocodeByAddress(address);
            const { lat, lng } = await getLatLng(results[0]);
            setMapCenter({ lat, lng });
        } catch (error) {
            console.error('Error getting location:', error);
        }
    };

    errors;
    isSubmitting;
    eventsCol;
    return (
        <Container sx={{ mt: 2 }}>
            <Grid container justifyContent="center">
                <Grid item xs={12} sm={12} md={8}>
                    <Card sx={{ backgroundColor: '#fffde7' }}>
                        <CardContent>
                            <Box
                                component="form"
                                onSubmit={handleSubmit(onSubmit)}
                                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'le' }}>
                                {/* Form content goes here */}
                                <input type="file" id="image" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                                <label htmlFor="image">
                                    <Button className="w-full" component="span" variant="contained" color="secondary">
                                        Choose Image
                                    </Button>
                                </label>
                                {imagePreviewUrl && (
                                    <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
                                        <Button variant="contained" color="error" onClick={handleDiscardImage} sx={{ mt: 2 }}>
                                            <RemoveCircleOutline />
                                        </Button>
                                    </Box>
                                )}

                                <Controller
                                    name="name"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Event Name"
                                            error={!!errors.name}
                                            helperText={errors.name?.message}
                                            fullWidth
                                            sx={{ mt: 2, mb: 2 }}
                                        />
                                    )}
                                />
                                <LocalizationProvider dateAdapter={AdapterDateFns}>
                                    <Controller
                                        name="eventDateTime"
                                        control={control}
                                        defaultValue={new Date()}
                                        render={({ field }) => (
                                            <DesktopDateTimePicker label="Event Date Time" value={field.value} onChange={field.onChange} />
                                        )}
                                    />
                                </LocalizationProvider>
                                {/* <FormControl fullWidth>
                    <InputLabel id="city-label">City</InputLabel>
                    <Select labelId="city-label" value={selectedCity} label="City" onChange={(e) => setSelectedCity(e.target.value as string)}>
                        <MenuItem value="Copenhagen">Copenhagen</MenuItem>
                        <MenuItem value="Malmö">Malmö</MenuItem>
                    </Select>
                </FormControl> */}
                                 <Controller
                  name="address"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <>
                      <PlacesAutocomplete
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value); // Notify react-hook-form of the change
                          handleAddressSelect(value); // Update the map location
                        }}
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        selectedCity={''} // You can provide a dynamic value if needed
                      />
                      {mapCenter && (
                        <AddressMap center={mapCenter} /> // Display the map here
                      )}
                    </>
                  )}
                />

                                <Controller
                                    name="email"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Email (Optional)"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                            fullWidth
                                            sx={{ mt: 2, mb: 2 }}
                                        />
                                    )}
                                />
                                <Controller
                                    name="website"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Website (Optional)"
                                            error={!!errors.website}
                                            helperText={errors.website?.message}
                                            fullWidth
                                            sx={{ mt: 2, mb: 2 }}
                                        />
                                    )}
                                />
                                <Controller
                                    name="description"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            label="Description"
                                            error={!!errors.description}
                                            helperText={errors.description?.message}
                                            multiline
                                            rows={4}
                                            fullWidth
                                            sx={{ mb: 2, mt: 2 }}
                                        />
                                    )}
                                />

                                <Controller
                                    name="category"
                                    control={control}
                                    defaultValue={categoryValues[0]} // Default value is the first category
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.category} sx={{ mb: 2 }}>
                                            <InputLabel id="category-label">Category</InputLabel>
                                            <Select {...field} labelId="category-label" label="Category">
                                                {categoryValues.map((category, index) => (
                                                    <MenuItem key={index} value={category}>
                                                        {category}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>{errors.category?.message}</FormHelperText>
                                        </FormControl>
                                    )}
                                />

                                <Controller
                                    name="ageGroup"
                                    control={control}
                                    defaultValue={ageGroups[0]} // Default value is the first age group
                                    render={({ field }) => (
                                        <FormControl fullWidth error={!!errors.ageGroup} sx={{ mb: 2 }}>
                                            <InputLabel id="agegroup-label">Age Group</InputLabel>
                                            <Select {...field} labelId="agegroup-label" label="Age Group">
                                                {ageGroups.map((ageGroup, index) => (
                                                    <MenuItem key={index} value={ageGroup}>
                                                        {ageGroup}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            <FormHelperText>{errors.ageGroup?.message}</FormHelperText>
                                        </FormControl>
                                    )}
                                />

                                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} className="w-full" sx={{ mb: 4 }}>
                                    {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default EventForm;
