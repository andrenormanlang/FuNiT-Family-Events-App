import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signOut,
    updateEmail,
    updatePassword,
    updateProfile,
    User
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useSnackbar } from './SnackBarProvider';
import { auth, usersCol } from '../services/firebase';
import { UserInfo } from '../types/User.types';
import useGetUser from '../hooks/useGetUser';

type AuthContextType = {
    reloadUser: () => Promise<boolean>;
    resetPassword: (email: string) => Promise<void>;
    setDisplayName: (name: string) => void;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    setPhotoUrl: (photoURL: string) => void;
    signInUser: (email: string, password: string) => Promise<void>;
    signOutUser: () => Promise<void>;
    signUpUser: (email: string, name: string, password: string) => Promise<void>;
    signedInUser: User | null;
    signedInUserInfo: UserInfo | null;
    signedInUserEmail: string | null;
    signedInUserName: string | null;
    signedInUserPhotoUrl: string | null;
};

export const AuthContext = createContext<AuthContextType | null>(null);

type AuthContextProps = {
    children: React.ReactNode;
};

const AuthContextProvider: React.FC<AuthContextProps> = ({ children }) => {
    const [signedInUser, setSignedInUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showMessage } = useSnackbar();
    const [signedInUserEmail, setSignedInUserEmail] = useState<string | null>(null);
    const [signedInUserName, setSignedInUserName] = useState<string | null>(null);
    const [signedInUserPhotoUrl, setSignedInUserPhotoUrl] = useState<string | null>(null);

    const { data: signedInUserInfo } = useGetUser(signedInUser?.uid ?? '');

    const reloadUser = async () => {
        if (!auth.currentUser) {
            // setSignedInUser(null);
            // setSignedInUserEmail(null);
            // setSignedInUserName(null);
            // setSignedInUserPhotoUrl(null);
            return false;
        }

        setSignedInUserName(auth.currentUser.displayName);
        setSignedInUserEmail(auth.currentUser.email);
        setSignedInUserPhotoUrl(auth.currentUser.photoURL);

        return true;
    };

    const resetPassword = (email: string) => {
        return sendPasswordResetEmail(auth, email, {
            url: window.location.origin + '/sign-in'
        });
    };

    const setEmail = (email: string) => {
        if (!signedInUser) {
            throw new Error('No signed in user');
        }

        const docRef = doc(usersCol, signedInUser.uid);
        updateDoc(docRef, {
            email,
            updatedAt: serverTimestamp()
        });

        return updateEmail(signedInUser, email);
    };

    const setDisplayName = (displayName: string) => {
        if (!signedInUser) {
            throw new Error('No signed in user');
        }

        const docRef = doc(usersCol, signedInUser.uid);
        updateDoc(docRef, {
            displayName,
            updatedAt: serverTimestamp()
        });

        return updateProfile(signedInUser, {
            displayName
        });
    };

    const setPassword = (password: string) => {
        if (!signedInUser) {
            throw new Error('No signed in user');
        }

        return updatePassword(signedInUser, password);
    };

    const setPhotoUrl = (photoURL: string) => {
        if (!signedInUser) {
            throw new Error('No signed in user');
        }

        const docRef = doc(usersCol, signedInUser.uid);
        updateDoc(docRef, {
            photoURL,
            updatedAt: serverTimestamp()
        });

        setSignedInUserPhotoUrl(photoURL);

        showMessage(photoURL ? 'Photo updated' : 'Photo deleted');

        return updateProfile(signedInUser, {
            photoURL
        });
    };

    const signInUser = async (email: string, password: string) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        showMessage('Welcome back, ' + userCredential.user.displayName);
    };

    const signOutUser = () => {
        showMessage('Welcome back anytime, ' + signedInUserName);
        return signOut(auth);
    };

    const signUpUser = async (email: string, displayName: string, password: string) => {
        const newUserCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = newUserCredential.user;

        const randomPhoto = 'https://picsum.photos/200';

        updateProfile(newUser, {
            displayName,
            photoURL: randomPhoto
        });
        setSignedInUserName(displayName);
        setSignedInUserPhotoUrl(randomPhoto);

        const docRef = doc(usersCol, newUser.uid);
        setDoc(docRef, {
            createdAt: serverTimestamp(),
            email,
            isAdmin: false,
            displayName,
            photoURL: randomPhoto,
            uid: newUser.uid,
            updatedAt: serverTimestamp()
        });

        showMessage('Welcome, ' + displayName);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setSignedInUser(user);

            if (user) {
                setSignedInUserEmail(user.email);
                setSignedInUserName(user.displayName);
                setSignedInUserPhotoUrl(user.photoURL);
            } else {
                
                setSignedInUserEmail(null);
                setSignedInUserName(null);
                setSignedInUserPhotoUrl(null);
            }
            setIsLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider
            value={{
                reloadUser,
                resetPassword,
                setDisplayName,
                setEmail,
                setPassword,
                setPhotoUrl,
                signInUser,
                signOutUser,
                signUpUser,
                signedInUser,
                signedInUserInfo,
                signedInUserEmail,
                signedInUserName,
                signedInUserPhotoUrl
            }}>
            {isLoading ? (
                <div className="flex justify-center items-center">           
              <Box 
  display="flex"
  justifyContent="center"
  alignItems="center"
  position="fixed"  // Use fixed positioning
  top="40%"        // Adjust this to move the CircularProgress up
  left="50%"       // Center horizontally
  style={{ transform: 'translate(-50%, -40%)' }} // Adjust the transform to align correctly
>
  <CircularProgress color="secondary" size={80} />
</Box>
                </div>
            ) : (
                <>{children}</>
            )}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
