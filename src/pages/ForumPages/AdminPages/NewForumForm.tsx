import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box } from '@mui/material';
import { db } from '../../../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import useAuth from '../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// Zod schema for Forum data validation
const forumSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters')
});

type ForumFormData = z.infer<typeof forumSchema>;

const NewForumForm: React.FC = () => {
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<ForumFormData>({
        resolver: zodResolver(forumSchema)
    });
    const { signedInUserInfo } = useAuth();

    const navigate = useNavigate();

    const onSubmit = async (data: ForumFormData) => {
        if (!signedInUserInfo) {
            alert('You must be logged in to create a forum.');
            return;
        }

        const newForumData = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        await addDoc(collection(db, 'forums'), newForumData);
        reset();
        alert('Forum created successfully!');
    };

    const handleBack = () => {
        navigate('/forums'); // Adjust the path as needed to navigate back to the forums list
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
                padding: 3,
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: 'background.paper',
                maxWidth: 500,
                mx: 'auto',
                my: 4
            }}
        >
            <Controller
                name="title"
                control={control}
                defaultValue=""
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Title"
                        error={!!errors.title}
                        helperText={errors.title?.message}
                        fullWidth
                        variant="outlined"
                        margin="normal"
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
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        fullWidth
                        variant="outlined"
                        margin="normal"
                    />
                )}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button variant="outlined" onClick={handleBack} sx={{ width: 'fit-content' }}>
                    Back to Forums List
                </Button>
                <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ width: 'fit-content' }}>
                    {isSubmitting ? 'Creating...' : 'Create Forum'}
                </Button>
            </Box>
        </Box>
    );
};

export default NewForumForm;
