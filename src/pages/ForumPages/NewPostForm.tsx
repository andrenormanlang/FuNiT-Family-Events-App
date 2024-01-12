import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, CircularProgress, Avatar, Typography } from '@mui/material';
import { db, storage } from '../../services/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import useAuth from '../../hooks/useAuth';

import { useState, useEffect } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useParams } from 'react-router-dom';

// Zod schema for Post data validation
const postSchema = z.object({
    content: z.string().min(10, 'Content must be at least 10 characters')
});

type PostFormData = z.infer<typeof postSchema>;

interface Props {
    forumId: string;
    topicId: string;
}

const NewPostForm: React.FC<Props> = () => {
    const { forumId, topicId } = useParams<{ forumId: string; topicId: string }>();
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm<PostFormData>({
        resolver: zodResolver(postSchema)
    });
    const { signedInUserInfo } = useAuth();
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [creationTime] = useState(new Date().toLocaleString());

    useEffect(() => {
        if (selectedImage) {
            setImagePreviewUrl(URL.createObjectURL(selectedImage));
        }
    }, [selectedImage]);

    const onSubmit = async (data: PostFormData) => {
        if (!forumId || !topicId) {
            console.error('forumId or topicId is undefined');
            return;
        }

        try {
            let imageUrl = ''; // Initialize imageUrl as an empty string

            // Only attempt to upload if a file is selected
            if (selectedImage) {
                const imageRef = ref(storage, `forumImages/${selectedImage.name}`);
                const uploadResult = await uploadBytes(imageRef, selectedImage);
                imageUrl = await getDownloadURL(uploadResult.ref);
            }

            const newPostRef = doc(collection(db, 'forums', forumId, 'topics', topicId, 'posts'));

            // Prepare the post data, including imageUrl only if available
            const newPostData = {
                content: data.content,
                authorId: signedInUserInfo?.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
                ...(imageUrl && { imageUrl }) // Spread operator to conditionally add imageUrl property
            };

            console.log('Preparing to create post with the following data:', newPostData);
            await setDoc(newPostRef, newPostData);
            // Create the post document with newPostData

            await setDoc(newPostRef, newPostData);
            reset();
            alert('Post created successfully!');
        } catch (error) {
            const err = error as Error;
            console.error('Error creating post:', err);
            alert('Error creating post: ' + err.message);
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedImage(event.target.files[0]);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 500, margin: 'auto' }}>
            {signedInUserInfo && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        src={signedInUserInfo.photoURL || undefined}
                        alt={signedInUserInfo.displayName || 'User'}
                        sx={{ width: 50, height: 50, mr: 2 }}
                    />
                    <Typography variant="h6">{signedInUserInfo.displayName}</Typography>
                </Box>
            )}
            <Typography variant="caption">Creating post on: {creationTime}</Typography>
            <Box my={2}>
                <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="post-image-upload" />
                <label htmlFor="post-image-upload">
                    <Button variant="contained" component="span">
                        Upload Image (Optional)
                    </Button>
                </label>
                {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />}
            </Box>
            <Controller
                name="content"
                control={control}
                defaultValue=""
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Content"
                        multiline
                        rows={4}
                        error={!!errors.content}
                        helperText={errors.content?.message}
                        fullWidth
                    />
                )}
            />
            <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ mt: 2 }}>
                {isSubmitting ? <CircularProgress size={24} /> : 'Create Post'}
            </Button>
        </Box>
    );
};

export default NewPostForm;
