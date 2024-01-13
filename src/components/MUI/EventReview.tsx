interface EventReviewProps {
    event: Event;
}

import React, { useState, useEffect } from 'react';
import useAuth from '../../hooks/useAuth';
import { Event } from '../../types/Event.types';
import { Review } from '../../types/Review.types'; // Importing the Review type
import { Rating, TextField, Button, Avatar, Typography, Box, List, ListItem } from '@mui/material';
import { db } from '../../services/firebase';
import { addDoc, collection, query, where, onSnapshot, serverTimestamp, Timestamp } from 'firebase/firestore';
import {  formatDateWithoutYear } from '../../helpers/FormatDate';
import { useTheme } from '@mui/material/styles';

interface EventReviewProps {
    event: Event;
}

const EventReview: React.FC<EventReviewProps> = ({ event }) => {
    const { signedInUserInfo } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewText, setReviewText] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [canReview, setCanReview] = useState(false);
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        // Fetch reviews for the event
        const reviewsQuery = query(collection(db, 'reviews'), where('eventId', '==', event.id));
        const unsubscribe = onSnapshot(reviewsQuery, (snapshot) => {
            const fetchedReviews: Review[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data() as Review;
                fetchedReviews.push({ ...data, createdAt: data.createdAt });  // Converting Timestamp to Date
            });
            setReviews(fetchedReviews);
        });

        return () => unsubscribe();
    }, [event.id]);

    useEffect(() => {
        const checkReviewEligibility = () => {
            const now = new Date();
            const eventStart = event.eventDateTime.toDate();
            const oneHourAfterEventStart = new Date(eventStart.getTime() + 60 * 60 * 1000); // Add 1 hour
    
            setCanReview(now >= oneHourAfterEventStart);
        };
    
        checkReviewEligibility();
    }, [event.eventDateTime]);
    

    const handleReviewSubmit = async () => {
        if (!signedInUserInfo || !rating || reviewText.length < 10) return;
        setLoading(true);
        try {
            const review: Review = {
                userId: signedInUserInfo.uid,
                eventId: event.id,
                text: reviewText,
                rating: rating,
                createdAt: serverTimestamp()  as Timestamp, // TypeScript cast
                userName: signedInUserInfo.displayName,
                userPhotoURL: signedInUserInfo.photoURL
            };

            await addDoc(collection(db, 'reviews'), review);
            setReviewText('');
            setRating(null);
        } catch (error) {
            console.error('Error submitting review:', error);
        }
        setLoading(false);
    };


    if (!signedInUserInfo) {
        return <Typography variant='body2' sx={{color: theme.palette.error.dark, fontWeight: 'bold' }}>You must be logged in to submit a review.</Typography>;
    }
    
    if (!canReview) {
        // Create a new Date object for one hour after the event's start time
        const reviewTime = new Date(event.eventDateTime.toDate().getTime() + 60 * 60 * 1000);
    
        // Use your formatDate helper to format this new Date object
        const { date, time } = formatDateWithoutYear(reviewTime);
    
        // Return the message with the formatted date and time
        return (
            <Typography variant='body2' sx={{color: theme.palette.error.dark, fontWeight: 'bold' }}>
                You may only submit reviews after {date} at {time}.
            </Typography>
        );
    }

    return (
        <Box>
            <List>
                {reviews.map((review, index) => (
                    <ListItem key={index}>
                        <Avatar src={review.userPhotoURL} />
                        <Box>
                            <Typography variant="subtitle2">{review.userName}</Typography>
                            <Rating value={review.rating} readOnly />
                            <Typography variant="body2">{review.text}</Typography>
                        </Box>
                </ListItem>
            ))}
        </List>

        {signedInUserInfo && canReview && (
            <Box>
                {/* Review Submission Form */}
                <Avatar src={signedInUserInfo.photoURL} />
                <Typography>{signedInUserInfo.displayName}</Typography>
                <Rating
                    name="event-rating"
                    value={rating}
                    onChange={(_event, newValue) => {
                        setRating(newValue);
                    }}
                />
                <TextField
                    label="Your Review"
                    multiline
                    rows={4}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    variant="outlined"
                    margin="normal"
                    fullWidth
                />
                <Button 
                    onClick={handleReviewSubmit} 
                    disabled={loading || reviewText.length < 10 || rating === null} 
                    variant="contained" 
                    color="primary"
                >
                    Submit Review
                </Button>
            </Box>
        )}

    </Box>
);
};

export default EventReview;
