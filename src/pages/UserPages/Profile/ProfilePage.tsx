import { FirebaseError } from 'firebase/app';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import useAuth from '../../../hooks/useAuth';
import { useRef, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { storage, usersCol } from '../../../services/firebase';
import { UserUpdate } from '../../../types/User.types';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    LinearProgress,
    TextField,
    Typography,
    Avatar,
    IconButton,
    FormControl
} from '@mui/material';
import { CameraAlt, Delete, Shuffle } from '@mui/icons-material';
import { useSnackbar } from '../../../contexts/SnackBarProvider';

const Profile = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const { showMessage } = useSnackbar();

    const {
        reloadUser,
        setDisplayName,
        setEmail,
        setPassword,
        setPhotoUrl,
        signedInUser,
        signedInUserName,
        signedInUserEmail,
        signedInUserPhotoUrl
    } = useAuth();

    const {
        handleSubmit,
        register,
        resetField,
        setValue,
        watch,
        formState: { errors }
    } = useForm<UserUpdate>({
        defaultValues: {
            displayName: signedInUserName ?? '',
            email: signedInUserEmail ?? ''
        }
    });

    const passwordRef = useRef('');
    passwordRef.current = watch('password') ?? '';

    const photoRef = useRef<FileList | null>(null);
    photoRef.current = watch('photoFile');

    if (!signedInUser) return;

    const onUpdateProfile: SubmitHandler<UserUpdate> = async (data) => {
        try {
            setIsSubmitting(true);

            if (data.displayName && data.displayName !== signedInUserName) {
                await setDisplayName(data.displayName);
                showMessage('Name updated successfully');
            }

            if (data.photoFile.length) {
                const photo = data.photoFile[0];

                const fileRef = ref(storage, `users/${signedInUser.uid}/${photo.name}`);

                const uploadTask = uploadBytesResumable(fileRef, photo);

                uploadTask.on('state_changed',snapshot => {
                        setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 1000) / 10);
                    },(error) => {
                        showMessage(error.message);
                    },async () => {
                        setUploadProgress(null);
                        resetField('photoFile');

                        const photoUrl = await getDownloadURL(fileRef);
                        await setPhotoUrl(photoUrl);
                        await reloadUser();
                        if (photoRef.current) photoRef.current = null;
                    });
                }

                if (data.email && data.email !== signedInUserEmail) {
                    await setEmail(data.email);
                    showMessage('Email updated successfully');
                }

                if (data.password) {
                    try {
                        await setPassword(data.password);

                        const docRef = doc(usersCol, signedInUser.uid);
                        updateDoc(docRef, {
                            updatedAt: serverTimestamp()
                        });

                        showMessage('Password updated successfully');
                    } catch (error) {
                        showMessage('Please sign out and in again before changing password');
                    }

                    setValue('password', '');
                    setValue('passwordConfirm', '');
                }

                await reloadUser();

                setIsSubmitting(false);
            } catch (error) {
                if (error instanceof FirebaseError) {
                    // Check for the specific error code
                    if (error.code === 'auth/credential-too-old-login-again') {
                        // Display a specific message for this error
                        showMessage('Your session is too old. Please log out and log back in to update your profile.');
                    } else {
                        // Handle other Firebase errors
                        showMessage(error.message);
                    }
                } else {
                    // Handle non-Firebase errors
                    showMessage('Something went wrong when trying to update profile');
                }
                setIsSubmitting(false);
            }
    };

    const handleUpdatePhoto = async (photoUrl: string) => {
            await setPhotoUrl(photoUrl);
            await reloadUser();
            showMessage('Profile photo updated successfully');
    };

    // Inside handleUpdatePhoto

    return (
        <Container>
            <Grid container justifyContent="center">
                <Grid item xs={12} md={8} lg={6}>
                <Card sx={{ backgroundColor: '#b2eae8' }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Update Profile
                            </Typography>

                            {uploadProgress !== null && <LinearProgress variant="determinate" value={uploadProgress} />}

                            <Box component="form" onSubmit={handleSubmit(onUpdateProfile)} noValidate>
                                {/* Name Field */}
                                <TextField
                                    id="displayName"
                                    label="New Name"
                                    type="text"
                                    {...register('displayName')}
                                    error={!!errors.displayName}
                                    helperText={errors.displayName?.message}
                                    fullWidth
                                    margin="normal"
                                />

                                {/* Photo Upload Section */}
                                <Box display="flex" justifyContent="center" alignItems="center" my={3}>
                                    <Avatar
                                        id="photoUrl"
                                        src={signedInUserPhotoUrl || 'https://via.placeholder.com/200'}
                                        sx={{ width: 150, height: 150, mb: 2 }} // Increased size and margin bottom
                                    />
                                </Box>
                                <Box display="flex" justifyContent="center" alignItems="center">
                                    <Button
                                        disabled={signedInUserPhotoUrl === null}
                                        onClick={() => handleUpdatePhoto('')}
                                        size="small"
                                        variant="contained"
                                        color="secondary"
                                        sx={{ mx: 2 }}>
                                        <Delete />
                                    </Button>
                                    <Button
                                        disabled={signedInUserPhotoUrl === 'https://picsum.photos/200'}
                                        onClick={() => handleUpdatePhoto('https://picsum.photos/200')}
                                        size="small"
                                        variant="contained"
                                        color="secondary">
                                        <Shuffle />
                                    </Button>
                                </Box>
                                <FormControl
                                    sx={{
                                        width: '100%',
                                        backgroundColor: '#f5f5f5',
                                        padding: '10px',
                                        borderRadius: '4px',
                                        mt: 2
                                    }}>
                                    <FormControl>
                                        <input
                                            accept="image/jpeg, image/png, image/webp, image/gif"
                                            type="file"
                                            id="icon-button-file"
                                            style={{ display: 'none' }}
                                            {...register('photoFile')}
                                        />
                                    </FormControl>
                                    {errors.photoFile && <p className="invalid-value">{errors.photoFile.message ?? 'Invalid value'}</p>}
                                    <Typography>
                                        <label htmlFor="icon-button-file">
                                            <IconButton
                                                color="primary"
                                                aria-label="upload picture"
                                                component="span"
                                                sx={{
                                                    backgroundColor: '#e0e0e0',
                                                    marginRight: '10px'
                                                }}>
                                                <CameraAlt />
                                            </IconButton>
                                        </label>
                                        {uploadProgress !== null ? (
                                            <>
                                                <LinearProgress variant="determinate" value={uploadProgress}  sx={{height: 15, mt:2}} />
                                                <Typography variant="body2" color="textSecondary">
                                                    {`${uploadProgress}%`}
                                                </Typography>
                                            </>
                                        ) : (
                                            photoRef.current &&
                                            photoRef.current.length > 0 && (
                                                <span>
                                                    {photoRef.current[0].name} ({Math.round(photoRef.current[0].size / 1024)} kB)
                                                </span>
                                            )
                                        )}
                                    </Typography>
                                </FormControl>

                                
                                <TextField
                                    id="email"
                                    label="Change Email"
                                    type="email"
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    fullWidth
                                    margin="normal"
                                />
                                
                                {/* Password Fields */}
                                <TextField
                                    id="password"
                                    label="Change Password"
                                    type="password"
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                    fullWidth
                                    margin="normal"
                                />

                                <TextField
                                    id="passwordConfirm"
                                    label="Confirm New Password"
                                    type="password"
                                    {...register('passwordConfirm')}
                                    error={!!errors.passwordConfirm}
                                    helperText={errors.passwordConfirm?.message}
                                    fullWidth
                                    margin="normal"
                                    sx={{ mb: 2 }}
                                />

                                {/* Submit Button */}
                                <Button disabled={isSubmitting} size="small" type="submit" variant="contained" color="primary">
                                    {isSubmitting ? 'Updating Profile...' : 'Update Profile'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Profile;
