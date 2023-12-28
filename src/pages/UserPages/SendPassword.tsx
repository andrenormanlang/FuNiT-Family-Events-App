import  { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Card, CardContent, Typography, Container, Grid, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import { FirebaseError } from 'firebase/app';
import useAuth from '../../hooks/useAuth';
import { ForgotPassword } from '../../types/User.types';

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email missing"),
});

const SendPassword = () => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { resetPassword } = useAuth();

    const { handleSubmit, register, formState: { errors } } = useForm<ForgotPassword>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onForgotPassword = async (data: ForgotPassword) => {
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            setIsSubmitting(true);
            await resetPassword(data.email);
            setSuccessMessage("Check your email for password reset instructions.");
            setIsSubmitting(false);
        } catch (error) {
            if (error instanceof FirebaseError) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Something went wrong. Please try again.");
            }
            setIsSubmitting(false);
        }
    };

    return (
        <Container className="py-3 center-y">
            <Grid container justifyContent="center">
                <Grid item xs={12} md={6} lg={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h5" className="mb-3">Forgot Password</Typography>

                            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                            {successMessage && <Alert severity="success">{successMessage}</Alert>}

                            <form onSubmit={handleSubmit(onForgotPassword)}>
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

                                <Button
                                    disabled={isSubmitting}
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    className="mt-4"
                                >
                                    {isSubmitting ? "Sending..." : "Send Reset Email"}
                                </Button>
                            </form>

                            <div className="text-center mt-3">
                                <Link to="/login" className="text-blue-500 hover:text-blue-700">
                                    Remembered your password? Log In
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center mt-3">
                        <span className="text-sm">
                            Need an account? <br />
                            <Link to="/register" className="text-blue-500 hover:text-blue-700">
                                Register
                            </Link>
                        </span>
                    </div>
                </Grid>
            </Grid>
        </Container>
  )
}

export default SendPassword
