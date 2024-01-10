import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { db } from '../../services/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import useAuth from '../../hooks/useAuth';
import { useParams } from 'react-router-dom';

// Zod schema for Post data validation
const postSchema = z.object({
  content: z.string().min(10, 'Content must be at least 10 characters'),
});

type PostFormData = z.infer<typeof postSchema>;

interface Props {
    forumId: string;
    topicId: string;
  }

const NewPostForm: React.FC<Props> = () => {
    const { forumId, topicId } = useParams<{ forumId: string; topicId: string }>();
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
  });
  const { signedInUserInfo } = useAuth();

  const onSubmit = async (data: PostFormData) => {
    if (!signedInUserInfo) {
      alert('You must be logged in to create a post.');
      return;
    }
  
    if (!forumId || !topicId) {
      console.error('Forum ID or Topic ID is undefined');
      return;
    }

    const newPostRef = doc(collection(db, 'forums', forumId, 'topics', topicId, 'posts'));
    const newPostData = {
      ...data,
      authorId: signedInUserInfo.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(newPostRef, newPostData);
    reset();
    alert('Post created successfully!');
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="content"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="Content" multiline rows={4} error={!!errors.content} helperText={errors.content?.message} fullWidth />}
      />
      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
        {isSubmitting ? <CircularProgress size={24} /> : 'Create Post'}
      </Button>
    </Box>
  );
};

export default NewPostForm;