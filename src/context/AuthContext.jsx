import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
    const [pendingTwoFactor, setPendingTwoFactor] = useState(false);
    const [pendingUserEmail, setPendingUserEmail] = useState('');
    const isLoginFlow = useRef(false);

    // Check if 2FA was already completed in this session
    const isTwoFactorVerified = () => {
        return sessionStorage.getItem('codecash_2fa_verified') === 'true';
    };

    // Helper to load full user profile from Firestore
    const loadUserProfile = async (firebaseUser) => {
        try {
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
                    avatar: userData.avatarUrl,
                    derivToken: userData.derivToken
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
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Check if 2FA is already verified for this session
                if (isTwoFactorVerified()) {
                    // Session verified - load user normally
                    await loadUserProfile(firebaseUser);
                } else if (isLoginFlow.current) {
                    // In the middle of login flow - OTP is pending
                    setPendingTwoFactor(true);
                    setPendingUserEmail(firebaseUser.email);
                } else {
                    // Firebase session exists but no 2FA verification
                    // (e.g., new browser tab, browser restart)
                    // Sign out for security - user must login fresh with 2FA
                    await firebaseSignOut(auth);
                    setUser(null);
                    setPendingTwoFactor(false);
                }
            } else {
                setUser(null);
                setPendingTwoFactor(false);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email, password) => {
        try {
            // Mark that we're in a login flow
            isLoginFlow.current = true;
            sessionStorage.removeItem('codecash_2fa_verified');

            // Step 1: Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Step 2: Send OTP via backend
            const token = await userCredential.user.getIdToken();
            const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!data.success) {
                // OTP send failed - sign out and throw
                await firebaseSignOut(auth);
                isLoginFlow.current = false;
                throw new Error(data.message || 'Failed to send verification code');
            }

            // Set pending state
            setPendingTwoFactor(true);
            setPendingUserEmail(data.email || email);

            return { requiresOtp: true, maskedEmail: data.email };
        } catch (error) {
            console.error('Sign in error:', error);
            isLoginFlow.current = false;

            let message = 'Login failed';
            if (error.code === 'auth/invalid-credential') {
                message = 'Invalid email or password';
            } else if (error.code === 'auth/user-not-found') {
                message = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Incorrect password';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Too many failed attempts. Please try again later';
            } else if (error.message && !error.code) {
                message = error.message;
            }
            throw new Error(message);
        }
    };

    const verifyOtp = async (code) => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('Session expired. Please sign in again.');
            }

            const token = await currentUser.getIdToken();
            const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ code })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Invalid verification code');
            }

            // OTP verified - complete login
            sessionStorage.setItem('codecash_2fa_verified', 'true');
            isLoginFlow.current = false;
            setPendingTwoFactor(false);

            // Load full user profile
            await loadUserProfile(currentUser);

            return { success: true };
        } catch (error) {
            console.error('OTP verification error:', error);
            throw error;
        }
    };

    const resendOtp = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                throw new Error('Session expired. Please sign in again.');
            }

            const token = await currentUser.getIdToken();
            const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

            const response = await fetch(`${API_URL}/api/auth/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || 'Failed to resend code');
            }

            return { success: true, maskedEmail: data.email };
        } catch (error) {
            console.error('Resend OTP error:', error);
            throw error;
        }
    };

    const cancelTwoFactor = async () => {
        try {
            await firebaseSignOut(auth);
            setPendingTwoFactor(false);
            setPendingUserEmail('');
            isLoginFlow.current = false;
            sessionStorage.removeItem('codecash_2fa_verified');
        } catch (error) {
            console.error('Cancel 2FA error:', error);
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

            // Skip 2FA for initial registration - user just created account
            sessionStorage.setItem('codecash_2fa_verified', 'true');

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
            setPendingTwoFactor(false);
            setPendingUserEmail('');
            isLoginFlow.current = false;
            sessionStorage.removeItem('codecash_2fa_verified');
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
            if (updates.derivToken !== undefined) firestoreUpdates.derivToken = updates.derivToken;

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
            pendingTwoFactor,
            pendingUserEmail,
            signIn,
            signUp,
            signOut,
            updateUser,
            resetPassword,
            verifyOtp,
            resendOtp,
            cancelTwoFactor
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
