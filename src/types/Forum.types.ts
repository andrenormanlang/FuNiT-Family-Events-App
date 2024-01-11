import { Timestamp } from 'firebase/firestore';
import { UserInfo } from './User.types';

export type TopicWithUserInfo = Topic & {
  author: UserInfo;
};

export type PostWithUserInfo = Post & {
  author: UserInfo;
};


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
    imageUrl?: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
};
