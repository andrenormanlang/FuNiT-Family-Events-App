// import React, { useState } from 'react';
// import { TextField, Button, Rating } from '@mui/material';
// import { db } from '../../services/firebase';
// import { Timestamp, addDoc, collection } from 'firebase/firestore';
// import { Review as ReviewType } from '../../types/Review.types'; 
// const Review = ({ eventId, userId }) => {
//     const [reviewText, setReviewText] = useState('');
//     const [rating, setRating] = useState(0);

//     const submitReviewHandler = async (e) => {
//         e.preventDefault();

//         const newReview: ReviewType = {
//             id: '', // This will be set by Firestore when the document is created
//             eventId,
//             userId,
//             rating,
//             comment: reviewText,
//             createdAt: Timestamp.now(), // Current timestamp
//         };

//         try {
//             // Add the review to Firestore
//             await addDoc(collection(db, 'reviews'), reviewData);
//             // Handle successful submission, e.g., clearing the form, showing a success message
//             setReviewText('');
//             setRating(0);
//             // ... other success handling
//         } catch (error) {
//             // Handle any errors that occur during submission
//             console.error('Error submitting review: ', error);
//             // ... error handling
//         }

//         // Implement the logic to submit the review to Firestore
//     };

//     return (
//         <form onSubmit={submitReviewHandler}>
//             <Rating
//                 value={rating}
//                 onChange={(event, newValue) => {
//                     setRating(newValue);
//                 }}
//             />
//             <TextField
//                 label="Your Review"
//                 multiline
//                 rows={4}
//                 value={reviewText}
//                 onChange={(e) => setReviewText(e.target.value)}
//                 variant="outlined"
//             />
//             <Button type="submit" variant="contained" color="primary">
//                 Submit Review
//             </Button>
//         </form>
//     );
// };

// export default Review;
