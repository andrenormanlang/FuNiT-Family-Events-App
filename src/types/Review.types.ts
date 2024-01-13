import { Timestamp } from 'firebase/firestore';

export type Review = {
    userId: string;
    eventId: string;
    text: string;
    rating: number;
    createdAt: Timestamp;
    userName?: string; // Optional, if you plan to include user's name in the review
    userPhotoURL?: string; // Optional, for user's avatar
};