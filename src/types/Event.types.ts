import { Timestamp } from 'firebase/firestore'

export type Event = {
    address: string;
    ageGroup: string;
    category: Category;
    date: Timestamp | Date;
    description: string;
    isApproved: boolean;
    imageUrl: string;
    name: string;
}

export type Category = 'Outdoor Adventures' | 'Educational Activities' | 'Health and Wellness' | 'Art, Film & Books' | 'Cooking' | 'Community Festivals' | 'DIY' | 'Games' | 'Music' | 'Other'

export type SelectCategory = Category | 'Category'
