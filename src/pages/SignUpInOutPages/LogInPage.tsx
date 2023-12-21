import  { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Card, CardContent, Typography, Container, Grid, Alert } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import useAuth from '../../hooks/useAuth';
import { Login } from '../../types/User.types';

const loginSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email missing"),
  password: z.string().min(6, "Enter at least 6 characters"),
});

const LogInPage = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signInUser } = useAuth();
    const navigate = useNavigate();

    const { handleSubmit, register, formState: { errors } } = useForm<Login>({
        resolver: zodResolver(loginSchema),
    });

    const onSignIn = async (data: Login) => {
        setIsError(false);
        setErrorMessage(null);

        try {
            setIsSubmitting(true);
            await signInUser(data.email, data.password);
            navigate('/');
        } catch (error) {
            if (error instanceof FirebaseError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Something went wrong when trying to sign in");
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
                            <Typography variant="h5" className="mb-3">Sign In</Typography>

                            {isError && <Alert severity="error">{errorMessage}</Alert>}

                            <form onSubmit={handleSubmit(onSignIn)}>
                                <TextField
                                    label="Email"
                                    variant="outlined"
                                    margin="normal"
                                    fullWidth
                                    {...register('email')}
                                    error={!!errors.email}
                                    helperText={errors.email?.message}
                                    className="mb-3"
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
                                    className="mb-3"
                                />

                                <Button
                                    disabled={isSubmitting}
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    className="mt-4"
                                >
                                    {isSubmitting ? "Signing In..." : "Sign In"}
                                </Button>
                            </form>

                            <div className="text-center mt-3">
                                <Link to="/forgot-password" className="text-blue-500 hover:text-blue-700">
                                    Forgot Password?
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-3">
                        <span className="text-sm">
                            Need an account? <br />
                            <Link to="/sign-up" className="text-blue-500 hover:text-blue-700">
                                Sign Up
                            </Link>
                        </span>
                    </div>
                </Grid>
            </Grid>
        </Container>
    );
};

export default LogInPage;

