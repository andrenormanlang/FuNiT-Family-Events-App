import { Timestamp, GeoPoint } from 'firebase/firestore';

export type Event = {
    id: string;
    address: string;
    ageGroup: string;
    category: Category;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    eventDateTime: Timestamp ;
    // eventDateStart: Timestamp;
    // eventDateEnd: Timestamp;
    description: string;
    email?: string;
    isApproved: boolean;
    imageUrl: string;
    location?: GeoPoint;
    name: string;
    website?: string;
};

export type AppEvent = {
    id: string;
    address?: string;
    ageGroup?: string;
    category?: Category;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    eventDateTime?:  Timestamp | null | string;
    // eventDateStart: Timestamp;
    // eventDateEnd: Timestamp;
    description?: string;
    email?: string;
    isApproved?: boolean;
    imageUrl?: string;
    location?: GeoPoint;
    name?: string;
    website?: string;
};

export type Category =
    | 'Art, Film & Books'
    | 'Community Festivals'
    | 'Cooking'
    | 'DIY'
    | 'Educational Activities'
    | 'Games'
    | 'Health and Wellness'
    | 'Music'
    | 'Theatre & Dance'
    | 'Other'
    | 'Outdoor Activities';

export type SelectCategory = Category | 'Category';
