import { Timestamp } from 'firebase/firestore'

export type Event = {
    id: string;
    address: string;
    ageGroup: string;
    category: Category;
    eventDateTime: Timestamp;
    eventDateStart: Timestamp;
    eventDateEnd: Timestamp;
    description: string;
    email?: string;
    isApproved: boolean;
    imageUrl: string;
    name: string;
    website?:string;
}

export type Category = 'Outdoor Adventures' | 'Educational Activities' | 'Health and Wellness' | 'Art, Film & Books' | 'Cooking' | 'Community Festivals' | 'DIY' | 'Games' | 'Music' | 'Other'

export type SelectCategory = Category | 'Category'
