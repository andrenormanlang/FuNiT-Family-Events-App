// import { FirebaseError } from 'firebase/app';
// import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
// import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
// import useAuth from '../../../hooks/useAuth';
// import { useRef, useState } from 'react';
// import { useForm, SubmitHandler } from 'react-hook-form';
// import { storage, usersCol } from '../../../services/firebase';
// import { UserUpdate } from '../../../types/User.types';
// import {
//     Box,
//     Button,
//     Card,
//     CardContent,
//     Container,
//     Grid,
//     LinearProgress,
//     TextField,
//     Typography,
//     Avatar,
//     IconButton
// } from '@mui/material';
// import { CameraAlt, Delete, Shuffle } from '@mui/icons-material';
// import { useSnackbar } from '../../../contexts/SnackBarProvider';

// const Profile = () => {

//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState<number | null>(null);
//     const { showMessage } = useSnackbar();
 

//     const {
//         reloadUser,
//         setDisplayName,
//         setEmail,
//         setPassword,
//         setPhotoUrl,
//         signedInUser,
//         signedInUserName,
//         signedInUserEmail,
//         signedInUserPhotoUrl
//     } = useAuth();

//     const {
//         handleSubmit,
//         register,
//         resetField,
//         setValue,
//         watch,
//         formState: { errors }
//     } = useForm<UserUpdate>({
//         defaultValues: {
//             displayName: signedInUserName ?? '',
//             email: signedInUserEmail ?? ''
//         }
//     });

//     const passwordRef = useRef('');
//     passwordRef.current = watch('password') ?? '';

//     const photoRef = useRef<FileList | null>(null);
//     photoRef.current = watch('photoFile');

//     if (!signedInUser) return;

//     const onUpdateProfile: SubmitHandler<UserUpdate> = async (data) => {
        
        

//         try {
//             setIsSubmitting(true);

//             if (data.displayName && data.displayName !== signedInUserName) {
//                 await setDisplayName(data.displayName);
//                 showMessage('Name updated successfully');
//             }

//             if (data.photoFile.length) {
//                 const photo = data.photoFile[0];

//                 const fileRef = ref(
//                     storage,
//                     `users/${signedInUser.uid}/${photo.name}`
//                 );

//                 const uploadTask = uploadBytesResumable(fileRef, photo);

//                 uploadTask.on(
//                     'state_changed',
//                     (snapshot) => {
//                         setUploadProgress(
//                             Math.round(
//                                 (snapshot.bytesTransferred /
//                                     snapshot.totalBytes) *
//                                     1000
//                             ) / 10
//                         );
//                     },
//                     (error) => {
                        
//                         showMessage(error.message);
//                     },
//                     async () => {
//                         setUploadProgress(null);
//                         resetField('photoFile');

//                         const photoUrl = await getDownloadURL(fileRef);
//                         await setPhotoUrl(photoUrl);
//                         await reloadUser();
//                         if (photoRef.current) photoRef.current = null;
//                     }
//                 );
//             }

//             if (data.email && data.email !== signedInUserEmail) {
//                 await setEmail(data.email);
//                 showMessage('Email updated successfully');
//             }

//             if (data.password) {
//                 try {
//                     await setPassword(data.password);

//                     const docRef = doc(usersCol, signedInUser.uid);
//                     updateDoc(docRef, {
//                         updatedAt: serverTimestamp()
//                     });

//                     showMessage('Password updated successfully');
//                 } catch (error) {
                    
//                     showMessage(
//                         'Please sign out and in again before changing password'
//                     );
//                 }

//                 setValue('password', '');
//                 setValue('passwordConfirm', '');
//             }

//             await reloadUser();

//             setIsSubmitting(false);
//         } catch (error) {
//             if (error instanceof FirebaseError) {
//                 showMessage(error.message);
//             } else {
//                 showMessage(
//                     'Something went wrong when trying to update profile'
//                 );
//             }
//             setIsSubmitting(false);
//         }
//     };

//     const handleUpdatePhoto = async (photoUrl: string) => {
//         await setPhotoUrl(photoUrl);
//         await reloadUser();
//     };

//     return (
//         <Container>
//             <Grid container justifyContent="center">
//                 <Grid item xs={12} md={8} lg={6}>
//                     <Card>
//                         <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                                 Update Profile
//                             </Typography>

                            

//                             {uploadProgress !== null && (
//                                 <LinearProgress
//                                     variant="determinate"
//                                     value={uploadProgress}
//                                 />
//                             )}

//                             <Box
//                                 component="form"
//                                 onSubmit={handleSubmit(onUpdateProfile)}
//                                 noValidate>
//                                 <TextField
//                                     id="displayName"
//                                     label="Name"
//                                     type="text"
//                                     {...register('displayName')}
//                                     error={!!errors.displayName}
//                                     helperText={errors.displayName?.message}
//                                     fullWidth
//                                     margin="normal"
//                                 />

//                                 <Box
//                                     display="flex"
//                                     justifyContent="center"
//                                     my={3}>
//                                     <Avatar
//                                         src={
//                                             signedInUserPhotoUrl ||
//                                             'https://via.placeholder.com/225'
//                                         }
//                                         sx={{ width: 100, height: 100 }}
//                                     />
//                                     <input
//                                         accept="image/*"
//                                         type="file"
//                                         id="icon-button-file"
//                                         style={{ display: 'none' }}
//                                          // This needs to be defined to handle file selection
//                                     />
//                                     <label htmlFor="icon-button-file">
//                                         <IconButton
//                                             color="primary"
//                                             aria-label="upload picture"
//                                             component="span">
//                                             <CameraAlt />
//                                         </IconButton>
//                                     </label>
//                                 </Box>

//                                 <Box
//                                     display="flex"
//                                     justifyContent="space-evenly"
//                                     mb={3}>
//                                     <IconButton
//                                         disabled={!signedInUserPhotoUrl}
//                                         onClick={() => handleUpdatePhoto('')}
//                                         color="error">
//                                         <Delete />
//                                     </IconButton>

//                                     <IconButton
//                                         onClick={() =>
//                                             handleUpdatePhoto(
//                                                 'https://picsum.photos/200'
//                                             )
//                                         }
//                                         color="primary">
//                                         <Shuffle />
//                                     </IconButton>
//                                 </Box>

//                                 <TextField
//                                     id="password"
//                                     label="Password"
//                                     type="password"
//                                     {...register('password')}
//                                     error={!!errors.password}
//                                     helperText={errors.password?.message}
//                                     fullWidth
//                                     margin="normal"
//                                 />

//                                 <TextField
//                                     id="passwordConfirm"
//                                     label="Confirm Password"
//                                     type="password"
//                                     {...register('passwordConfirm')}
//                                     error={!!errors.passwordConfirm}
//                                     helperText={errors.passwordConfirm?.message}
//                                     fullWidth
//                                     margin="normal"
//                                 />

//                                 <Button
//                                     disabled={isSubmitting}
//                                     size="small"
//                                     type="submit"
//                                     variant="contained"
//                                     color="primary">
//                                     {isSubmitting
//                                         ? 'Updating Profile...'
//                                         : 'Update Profile'}
//                                 </Button>
//                             </Box>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//             </Grid>
//         </Container>
//     );
// };

// export default Profile;
