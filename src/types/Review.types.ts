import { Timestamp } from "firebase/firestore";

export type Review = {
    id: string; 
    eventId: string; 
    userId: string; 
    rating: number; 
    comment: string; 
    createdAt: Timestamp; 
  }