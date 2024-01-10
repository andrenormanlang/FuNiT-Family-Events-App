import { Timestamp } from 'firebase/firestore';

export type Forum = {
    id: string;
    title: string;
    description: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type Topic = {
    id: string;
    title: string;
    description: string;
    authorId: string;
    forumId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type Post = {
    id: string;
    title: string;
    content: string;
    authorId: string;
    topicId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};
