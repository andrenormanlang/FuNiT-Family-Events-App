import { Timestamp, GeoPoint } from 'firebase/firestore';

export type Event = {
    id: string;
    address: string;
    ageGroup: string;
    category: Categories;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    eventDateTime: Timestamp;
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
    category?: Categories;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
    eventDateTime?: Timestamp | null | string;
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

    export type Categories = 
    'Art, Film & Books' |
    'Community Festivals' |
    'Cooking' |
    'DIY' |
    'Educational Activities' |
    'Games' |   
    'Health and Wellness' |
    'Music' |
    'Theatre & Dance' |
    'Other' |  
    'Outdoor Activities';

    export enum Category {
        ArtFilmBooks = 'Art, Film & Books',
        CommunityFestivals = 'Community Festivals',
        Cooking = 'Cooking',
        DIY = 'DIY',
        EducationalActivities = 'Educational Activities',
        Games = 'Games',
        HealthAndWellness = 'Health and Wellness',
        Music = 'Music',
        TheatreDance = 'Theatre & Dance',
        Other = 'Other',
        OutdoorActivities = 'Outdoor Activities',
        All = 'All Categories',
        None = 'None' 
    }

    export enum AgeGroup {
        Group1 = '1-3 Years',
        Group2 = '4-6 Years',
        Group3 = '7-9 Years',
        Group4 = '7-12 Years',
        Group5 = '10-12 Years',
        Group6 = 'Age Group',
        All = 'All Age Groups',
        None = 'None'
    }