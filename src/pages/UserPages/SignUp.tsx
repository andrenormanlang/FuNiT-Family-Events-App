import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Card, CardContent, Typography, Container, Grid } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import useAuth from '../../hooks/useAuth';

// Zod schema for form validation
const signUpSchema = z
    .object({
        displayName: z.string().min(1, 'Name missing'),
        email: z.string().email('Invalid email format').min(1, 'Email missing'),
        password: z.string().min(6, 'Enter at least 6 characters'),
        passwordConfirm: z.string()
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "Passwords don't match",
        path: ['passwordConfirm']
    });

type FormData = {
    displayName: string;
    email: string;
    password: string;
    passwordConfirm: string;
};

const SignUp = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { signUpUser } = useAuth();
    const navigate = useNavigate();

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(signUpSchema)
    });

    const onSignUp = async (data: FormData) => {
        setIsError(false);
        setErrorMessage(null);

        try {
            setIsSubmitting(true);
            await signUpUser(data.email, data.displayName, data.password);
            navigate('/');
        } catch (error) {
            if (error instanceof FirebaseError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage('Something went wrong when trying to sign up');
            }
            setIsError(true);
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-3 center-y">
            <Grid container justifyContent="center">
                <Grid item xs={12} md={6} lg={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" className="mb-3">
                                Sign Up
                            </Typography>

                            {isError && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit(onSignUp)}>
                                <TextField
                                    label="Name"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    {...register('displayName')}
                                    error={!!errors.displayName}
                                    helperText={errors.displayName?.message}
                                />

                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                />

                                <TextField
                                    label="Password"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    type="password"
                                    autoComplete="new-password"
                                    {...register('password')}
                                    error={!!errors.password}
                                    helperText={errors.password?.message}
                                />

                                <TextField
                                    label="Confirm Password"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    type="password"
                                    {...register('passwordConfirm')}
                                    error={!!errors.passwordConfirm}
                                    helperText={errors.passwordConfirm?.message}
                                />

                                <Button
                                    disabled={isSubmitting}
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    className="mt-4"
                                >
                                    {isSubmitting ? 'Signing Up...' : 'Sign Up'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-3">
                        <span className="text-sm">
                            Already have an account? <br />
                            <Link to="/login" className="text-blue-500 hover:text-blue-700">
                                Login
                            </Link>
                        </span>
                    </div>
                </Grid>
            </Grid>
        </Container>
    );
};

export default SignUp;
