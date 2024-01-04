import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';

// Define the shape of the context
interface SavedEventsContextProps {
  savedEventsCount: number;

}

// Default values for the context
const defaultValues: SavedEventsContextProps = {
  savedEventsCount: 0,
  
};

// Create the context with the default values
const SavedEventsContext = createContext<SavedEventsContextProps>(defaultValues);

// Export the hook for consuming the context
// eslint-disable-next-line react-refresh/only-export-components
export const useSavedEvents = () => useContext(SavedEventsContext);

// Define the provider component
interface SavedEventsProviderProps {
  children: ReactNode;
}

export const SavedEventsProvider: React.FC<SavedEventsProviderProps> = ({ children }) => {
  const [savedEventsCount, setSavedEventsCount] = useState(0);
  const { signedInUser } = useAuth();

  useEffect(() => {
    let unsubscribe = () => {};

    if (signedInUser) {
      const q = query(collection(db, 'savedEvents'), where('userId', '==', signedInUser.uid));

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        setSavedEventsCount(querySnapshot.docs.length);
      }, (error) => {
        console.error("Error fetching real-time saved events count:", error);
      });
    }

    // Clean up the listener when the component unmounts or user changes
    return () => {
      if (unsubscribe) {
          unsubscribe();
      }
  };
  }, [signedInUser]);


  return (
    <SavedEventsContext.Provider value={{ savedEventsCount }}>
      {children}
    </SavedEventsContext.Provider>
  );
};

export default SavedEventsProvider;