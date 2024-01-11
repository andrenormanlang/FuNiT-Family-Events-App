import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, CircularProgress, Avatar, Typography } from '@mui/material';
import { db, storage } from '../../services/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import useAuth from '../../hooks/useAuth';

import { useState, useEffect } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';


// Zod schema for Post data validation
const postSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

type PostFormData = z.infer<typeof postSchema>;

interface Props {
    forumId: string;
    topicId: string;
  }

const NewPostForm: React.FC<Props> = ({forumId, topicId}) => {

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
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
    try {
    if (!signedInUserInfo) {
      alert('You must be logged in to create a post.');
      return;
    }
  
    if (!forumId || !topicId || !selectedImage) {
      console.error('Required information is missing.');
      return;
    }

    // Start image upload
    const imageRef = ref(storage, `forumImages/${selectedImage.name}`);
    await uploadBytes(imageRef, selectedImage);
    const imageUrl = await getDownloadURL(imageRef);

    const newPostRef = doc(collection(db, 'forums', forumId, 'topics', topicId, 'posts'));
    const newPostData = {
      ...data,
      imageUrl, // Add the image URL to your post data
      authorId: signedInUserInfo.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

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
          <Avatar src={signedInUserInfo.photoURL || undefined} alt={signedInUserInfo.displayName || 'User'} sx={{ width: 50, height: 50, mr: 2 }} />
          <Typography variant="h6">{signedInUserInfo.displayName}</Typography>
        </Box>
      )}
      <Typography variant="caption">Creating post on: {creationTime}</Typography>
      <Box my={2}>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
          id="post-image-upload"
        />
        <label htmlFor="post-image-upload">
          <Button variant="contained" component="span">Upload Image</Button>
        </label>
        {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" style={{ maxWidth: '100%', marginTop: '10px' }} />}
      </Box>
      <Controller
        name="content"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="Content" multiline rows={4} error={!!errors.content} helperText={errors.content?.message} fullWidth />}
      />
      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{ mt: 2 }}>
        {isSubmitting ? <CircularProgress size={24} /> : 'Create Post'}
      </Button>
    </Box>
  );
};

export default NewPostForm;