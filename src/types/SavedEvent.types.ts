import { Event } from './Event.types';

export type SavedEvent = {
    id: string;
    eventId: string; // ID of the event being saved
    userId: string; // ID of the user who saved the event
    eventData: Event;
};
