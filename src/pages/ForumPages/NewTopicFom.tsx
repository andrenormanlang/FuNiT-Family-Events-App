import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Box } from '@mui/material';
import { db } from '../../services/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import useAuth from '../../hooks/useAuth';

// Zod schema for Topic data validation
const topicSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
});

type TopicFormData = z.infer<typeof topicSchema>;

interface Props {
    forumId: string;
  }

  const NewTopicForm: React.FC<Props> = ({ forumId }) => {
  const { control, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TopicFormData>({
    resolver: zodResolver(topicSchema),
  });
  const { signedInUserInfo } = useAuth();

  const onSubmit = async (data: TopicFormData) => {
    if (!signedInUserInfo) {
      alert('You must be logged in to create a topic.');
      return;
    }

    const newTopicRef = doc(collection(db, 'forums', forumId, 'topics'));
    const newTopicData = {
      ...data,
      authorId: signedInUserInfo.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await setDoc(newTopicRef, newTopicData);
    reset();
    alert('Topic created successfully!');
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="title"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="Title" error={!!errors.title} helperText={errors.title?.message} fullWidth />}
      />
      <Controller
        name="description"
        control={control}
        defaultValue=""
        render={({ field }) => <TextField {...field} label="Description" multiline rows={4} error={!!errors.description} helperText={errors.description?.message} fullWidth />}
      />
      <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Topic'}
      </Button>
    </Box>
  );
};

export default NewTopicForm;