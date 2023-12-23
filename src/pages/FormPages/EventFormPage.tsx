import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, CircularProgress, MenuItem, Select, FormControl, InputLabel, FormHelperText } from '@mui/material';
import { Box } from '@mui/system';
import { DesktopDateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { eventsCol, storage } from '../../services/firebase';
import { addDoc } from 'firebase/firestore';
import { Libraries, useLoadScript } from '@react-google-maps/api';
import PlacesAutocomplete from '../../helpers/PlacesAutoComplete';

const libraries: Libraries = ['places'];

const ageGroups = [
    '1-3 Years', // Toddlers
    '4-6 Years', // Preschool to Early School Age
    '7-9 Years', // Mid School Age
    '10-12 Years' // Preteens
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
    'Outdoor Adventures',
    'Other'
] as const;

// Zod schema for event data validation
const eventSchema = z.object({
    name: z.string().min(3, 'Please enter the event name'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    eventDateTime: z.date(),
    address: z.string().min(1, 'Please enter an address'),
    // image: z.union([z.instanceof(File), z.null()]),
    ageGroup: z.enum(ageGroups),
    category: z.enum(categoryValues),
    email: z.string().email().optional(),
    website: z.string().url().optional()
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

    if (!isLoaded) return <div>Loading...</div>;

    const onSubmit = async (data: EventData) => {
        'Selected image:', selectedImage;
        'Form submitted', data;
        setIsSubmitting(true);
        let imageUrl = '';
        if (selectedImage) {
            const imageRef = ref(storage, `events/${selectedImage.name}`);
            const uploadResult = await uploadBytes(imageRef, selectedImage);
            imageUrl = await getDownloadURL(uploadResult.ref);
        }

        const eventDateTime = data.eventDateTime ? new Date(data.eventDateTime) : new Date();

        const eventData = {
            ...data,
            imageUrl,
            eventDateTime: Timestamp.fromDate(eventDateTime)
        };

        try {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            await addDoc(eventsCol, eventData);
            setValue('name', ''); // Reset the name field value
            setValue('description', ''); // Reset the description field value
            setValue('eventDateTime', new Date()); // Reset the eventDateTime field value
            setValue('address', ''); // Reset the address field value
            setValue('ageGroup', ageGroups[0]); // Reset the ageGroup field value
            setValue('category', categoryValues[0]); // Reset the category field value
            reset(); // Reset form fields after successful submission
            setSelectedImage(null); // Reset the image selection
            alert('Event submitted successfully!');
        } catch (error) {
            console.error('Error submitting event:', error);
            alert('Error submitting event.');
        } finally {
            setIsSubmitting(false);
        }

        data;
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            event.target.files[0]; // Log the selected file
            setSelectedImage(event.target.files[0]);
            const imageUrl = URL.createObjectURL(event.target.files[0]);
            setImagePreviewUrl(imageUrl); // Store the image URL in state
        }
    };

    'error', errors;
    'is submitting', isSubmitting;
    'events', eventsCol;
    return (
        <Box sx={{ width: { xs: '80%', sm: '60%', md: '40%' }, margin: 'auto' }}>
            {' '}
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md">
                <input type="file" id="image" onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
                <label htmlFor="image">
                    <Button className="w-full" component="span" variant="contained" color="secondary">
                        Choose Image
                    </Button>
                </label>
                {imagePreviewUrl && (
                    <Box sx={{ my: 2 }}>
                        <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', height: 'auto' }} />
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
                        render={({ field }) => <DesktopDateTimePicker label="Event Date Time" value={field.value} onChange={field.onChange} />}
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
                        <PlacesAutocomplete
                            field={field}
                            /* selectedCity={selectedCity} */ error={!!errors.address}
                            helperText={errors.address?.message}
                            selectedCity={''}
                        />
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
            </form>
        </Box>
    );
};

export default EventForm;
