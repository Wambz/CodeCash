import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get user profile from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            id: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: userData.name,
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            phone: userData.phone,
                            avatar: userData.avatarUrl
                        });
                    } else {
                        // User exists in Auth but not in Firestore - create profile
                        const userData = {
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || firebaseUser.email,
                            firstName: '',
                            lastName: '',
                            phone: '',
                            avatarUrl: firebaseUser.photoURL || null
                        };
                        await setDoc(doc(db, 'users', firebaseUser.uid), {
                            ...userData,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        });
                        setUser({
                            id: firebaseUser.uid,
                            ...userData,
                            avatar: userData.avatarUrl
                        });
                    }
                } catch (error) {
                    console.error('Error loading user profile:', error);
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: firebaseUser.displayName || firebaseUser.email
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // User state will be updated via onAuthStateChanged
            return userCredential.user;
        } catch (error) {
            console.error('Sign in error:', error);
            let message = 'Login failed';
            if (error.code === 'auth/invalid-credential') {
                message = 'Invalid email or password';
            } else if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Incorrect password';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many failed attempts. Please try again later';
            }
            throw new Error(message);
        }
    };

    const signUp = async (email, password, firstName, lastName, phone) => {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                email,
                firstName,
                lastName,
                name: `${firstName} ${lastName}`.trim(),
                phone,
                avatarUrl: null,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            return user;
        } catch (error) {
            console.error('Sign up error:', error);
            let message = 'Registration failed';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Email already in use';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Invalid email address';
            } else if (error.code === 'auth/weak-password') {
                message = 'Password should be at least 6 characters';
            }
            throw new Error(message);
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    };

    const updateUser = async (updates) => {
        try {
            if (!user?.id) return;

            // Update Firestore
            const userRef = doc(db, 'users', user.id);
            const firestoreUpdates = {};

            if (updates.avatar !== undefined) firestoreUpdates.avatarUrl = updates.avatar;
            if (updates.firstName !== undefined) firestoreUpdates.firstName = updates.firstName;
            if (updates.lastName !== undefined) firestoreUpdates.lastName = updates.lastName;
            if (updates.phone !== undefined) firestoreUpdates.phone = updates.phone;

            // Update full name if first or last name changed
            if (updates.firstName || updates.lastName) {
                const newFirstName = updates.firstName || user.firstName;
                const newLastName = updates.lastName || user.lastName;
                firestoreUpdates.name = `${newFirstName} ${newLastName}`.trim();
            }

            firestoreUpdates.updatedAt = new Date();

            await updateDoc(userRef, firestoreUpdates);

            // Optimistic local update
            const updatedUser = { ...user, ...updates };
            if (firestoreUpdates.name) updatedUser.name = firestoreUpdates.name;
            setUser(updatedUser);
        } catch (error) {
            console.error('Failed to update user:', error);
            throw error;
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            signIn,
            signUp,
            signOut,
            updateUser,
            resetPassword
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
