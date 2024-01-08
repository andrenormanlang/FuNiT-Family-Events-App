import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { CollectionReference, collection, DocumentData, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { Event } from '../types/Event.types';
import { UserInfo } from '../types/User.types';
import { SavedEvent } from '../types/SavedEvent.types';

// Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance and export it
export const auth = getAuth(app);

// Function to get and log the current user's ID token
const logUserIdToken = (user: User) => {
    user.getIdToken().then(idToken => {
        console.log("User ID Token:", idToken);
    }).catch(error => {
        console.error("Error getting ID token:", error);
    });
};

// Listen for authentication state changes
const setupAuthListener = () => {
    onAuthStateChanged(auth, user => {
        if (user) {
            // User is signed in, get the ID token
            console.log('User is signed in.');
            logUserIdToken(user);
        } else {
            // User is signed out
            console.log("User is signed out.");
        }
    });
};

// Call this function at the entry point of your app
setupAuthListener();

// Get Firestore instance
export const db = getFirestore(app);

// Get Storage instance
export const storage = getStorage(app);

// A helper to add the type to the db responses
const createCollection = <T = DocumentData>(collectionName: string): CollectionReference<T> => {
    return collection(db, collectionName) as CollectionReference<T>;
};

// Export collection references
export const eventsCol = createCollection<Event>('events');
export const usersCol = createCollection<UserInfo>('users');
export const savedEventsCol = createCollection<SavedEvent>('savedEvents');

export default app;
