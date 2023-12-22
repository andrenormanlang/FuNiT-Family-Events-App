import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import useAuth from '../hooks/useAuth';

// Define the shape of the context
interface SavedEventsContextProps {
  savedEventsCount: number;
  updateSavedEventsCount: () => Promise<void>;
}

// Default values for the context
const defaultValues: SavedEventsContextProps = {
  savedEventsCount: 0,
  updateSavedEventsCount: async () => {},
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

  const updateSavedEventsCount = async () => {
    if (signedInUser) {
      const q = query(collection(db, 'savedEvents'), where('userId', '==', signedInUser.uid));
      const querySnapshot = await getDocs(q);
      setSavedEventsCount(querySnapshot.docs.length);
    }
  };

  useEffect(() => {
    updateSavedEventsCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedInUser]);

  return (
    <SavedEventsContext.Provider value={{ savedEventsCount, updateSavedEventsCount }}>
      {children}
    </SavedEventsContext.Provider>
  );
};

export default SavedEventsProvider;