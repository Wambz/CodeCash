import express from 'express';
import { auth, firebaseInitialized } from '../config/firebase.config.js';
import {
    createUserProfile,
    getUserProfile,
    updateUserProfile
} from '../services/firestore.service.js';

const router = express.Router();

// Check if Firebase is available
const checkFirebase = (req, res, next) => {
    if (!firebaseInitialized) {
        return res.status(503).json({
            success: false,
            message: 'Firebase is not configured. Please set up Firebase credentials.'
        });
    }
    next();
};

// Middleware to verify Firebase ID token
async function verifyToken(req, res, next) {
    if (!firebaseInitialized) {
        return res.status(503).json({
            success: false,
            message: 'Firebase is not configured.'
        });
    }

    try {
        const token = req.headers.authorization?.split('Bearer ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const decodedToken = await auth.verifyIdToken(token);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
}

// Register - Create user in Firebase Auth and Firestore
router.post('/register', checkFirebase, async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        // Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: `${firstName} ${lastName}`.trim(),
        });

        // Create user profile in Firestore
        await createUserProfile(userRecord.uid, {
            firstName,
            lastName,
            name: `${firstName} ${lastName}`.trim(),
            email,
            phone,
            avatarUrl: null
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            uid: userRecord.uid
        });
    } catch (err) {
        console.error('Registration error:', err);

        // Handle specific Firebase errors
        if (err.code === 'auth/email-already-exists') {
            return res.status(400).json({ success: false, message: 'Email already in use' });
        }
        if (err.code === 'auth/invalid-password') {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
    }
});

// Login - Verify Firebase token and return user profile
// Note: Actual authentication happens client-side with Firebase Auth
// This endpoint just validates the token and returns user profile
router.post('/login', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;

        // Get user profile from Firestore
        const userProfile = await getUserProfile(uid);

        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        res.json({
            success: true,
            user: {
                id: uid,
                name: userProfile.name,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                email: userProfile.email,
                phone: userProfile.phone,
                avatar: userProfile.avatarUrl
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Get user profile (authenticated)
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const userProfile = await getUserProfile(uid);

        if (!userProfile) {
            return res.status(404).json({ success: false, message: 'User profile not found' });
        }

        res.json({
            success: true,
            user: {
                id: uid,
                name: userProfile.name,
                firstName: userProfile.firstName,
                lastName: userProfile.lastName,
                email: userProfile.email,
                phone: userProfile.phone,
                avatar: userProfile.avatarUrl
            }
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ success: false, message: 'Failed to get profile' });
    }
});

// Update Profile
router.post('/update', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const { avatar, firstName, lastName, phone } = req.body;

        const updates = {};
        if (avatar !== undefined) updates.avatarUrl = avatar;
        if (firstName !== undefined) updates.firstName = firstName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (phone !== undefined) updates.phone = phone;

        // Update full name if first or last name changed
        if (firstName || lastName) {
            const profile = await getUserProfile(uid);
            const newFirstName = firstName || profile.firstName;
            const newLastName = lastName || profile.lastName;
            updates.name = `${newFirstName} ${newLastName}`.trim();
        }

        // Update Firestore
        await updateUserProfile(uid, updates);

        // Update Firebase Auth display name and photo if provided
        const authUpdates = {};
        if (updates.name) authUpdates.displayName = updates.name;
        if (avatar) authUpdates.photoURL = avatar;

        if (Object.keys(authUpdates).length > 0) {
            await auth.updateUser(uid, authUpdates);
        }

        res.json({ success: true, message: 'Profile updated' });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ success: false, message: 'Update failed' });
    }
});

// Change Password
router.post('/change-password', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Update password in Firebase Auth
        await auth.updateUser(uid, {
            password: newPassword
        });

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ success: false, message: 'Failed to update password' });
    }
});

// Forgot Password - Send password reset email
router.post('/forgot-password', checkFirebase, async (req, res) => {
    try {
        const { email } = req.body;

        // Generate password reset link
        const resetLink = await auth.generatePasswordResetLink(email);

        // In production, you would send this via email
        // For development, we'll log it and return it
        console.log(`🔑 PASSWORD RESET LINK for ${email}:`);
        console.log(resetLink);

        res.json({
            success: true,
            message: 'Password reset link sent',
            debug_link: resetLink  // Remove in production
        });
    } catch (err) {
        console.error('Forgot password error:', err);

        // Always return success to prevent email enumeration
        res.json({
            success: true,
            message: 'If this email exists, a reset link has been sent'
        });
    }
});

// Reset Password - Handled client-side with Firebase Auth
// This endpoint is kept for backward compatibility but not used
router.post('/reset-password', async (req, res) => {
    res.json({
        success: true,
        message: 'Password reset should be handled client-side with Firebase Auth'
    });
});

// Verify token endpoint (for testing)
router.get('/verify', verifyToken, (req, res) => {
    res.json({
        success: true,
        user: {
            uid: req.user.uid,
            email: req.user.email
        }
    });
});

export default router;
export { verifyToken };
