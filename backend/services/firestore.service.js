import { db, firebaseInitialized } from '../config/firebase.config.js';
import admin from 'firebase-admin'; // Ensure admin is imported for FieldValue

/**
 * Firestore Service - Helper functions for database operations
 * Gracefully handles cases where Firebase is not configured
 */

// Check if Firestore is available
const checkFirestore = () => {
    if (!firebaseInitialized || !db) {
        throw new Error('Firestore is not configured. Please set up Firebase credentials.');
    }
};

// ==================== USER OPERATIONS ====================

/**
 * Create a new user profile in Firestore
 * @param {string} uid - Firebase Auth UID
 * @param {Object} userData - User profile data
 */
export async function createUserProfile(uid, userData) {
    checkFirestore();
    try {
        await db.collection('users').doc(uid).set({
            ...userData,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

/**
 * Get user profile from Firestore
 * @param {string} uid - Firebase Auth UID
 */
export async function getUserProfile(uid) {
    checkFirestore();
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (!doc.exists) {
            return null;
        }
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

/**
 * Update user profile in Firestore
 * @param {string} uid - Firebase Auth UID
 * @param {Object} updates - Fields to update
 */
export async function updateUserProfile(uid, updates) {
    checkFirestore();
    try {
        await db.collection('users').doc(uid).update({
            ...updates,
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// ==================== TRANSACTION OPERATIONS ====================

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data
 */
export async function createTransaction(transactionData) {
    checkFirestore();
    try {
        const docRef = await db.collection('transactions').add({
            ...transactionData,
            timestamp: new Date()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}

/**
 * Get all transactions for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of transactions to fetch
 */
export async function getUserTransactions(userId, limit = 50) {
    checkFirestore();
    try {
        const snapshot = await db.collection('transactions')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();

        const transactions = [];
        snapshot.forEach(doc => {
            transactions.push({ id: doc.id, ...doc.data() });
        });

        return transactions;
    } catch (error) {
        console.error('Error getting user transactions:', error);
        throw error;
    }
}

/**
 * Update transaction status
 * @param {string} transactionId - Transaction ID
 * @param {string} status - New status
 */
export async function updateTransactionStatus(transactionId, status) {
    checkFirestore();
    try {
        await db.collection('transactions').doc(transactionId).update({
            status,
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating transaction status:', error);
        throw error;
    }
}

/**
 * Get transaction by reference ID (for M-Pesa callbacks)
 * @param {string} referenceId - M-Pesa reference ID
 */
export async function getTransactionByReference(referenceId) {
    checkFirestore();
    try {
        const snapshot = await db.collection('transactions')
            .where('referenceId', '==', referenceId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return null;
        }

        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
    } catch (error) {
        console.error('Error getting transaction by reference:', error);
        throw error;
    }
}

// ==================== WALLET OPERATIONS ====================

/**
 * Get user wallet data (balance, payment methods)
 * @param {string} userId - User ID
 */
export async function getUserWallet(userId) {
    checkFirestore();
    try {
        const doc = await db.collection('users').doc(userId).get();
        if (!doc.exists) {
            return { balance: 0, paymentMethods: [] };
        }
        const data = doc.data();
        return {
            balance: data.walletBalance || 0,
            paymentMethods: data.paymentMethods || []
        };
    } catch (error) {
        console.error('Error getting user wallet:', error);
        return { balance: 0, paymentMethods: [] };
    }
}

/**
 * Add a payment method to user profile
 * @param {string} userId - User ID
 * @param {Object} method - Payment method details
 */
export async function addPaymentMethod(userId, method) {
    checkFirestore();
    try {
        await db.collection('users').doc(userId).update({
            paymentMethods: admin.firestore.FieldValue.arrayUnion(method),
            updatedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Error adding payment method:', error);
        throw error;
    }
}

/**
 * Update user wallet balance atomically
 * @param {string} userId - User ID
 * @param {number} amount - Amount to add (positive) or subtract (negative)
 */
export async function updateWalletBalance(userId, amount) {
    checkFirestore();
    try {
        const userRef = db.collection('users').doc(userId);

        // Use increment for atomic update
        await userRef.update({
            walletBalance: admin.firestore.FieldValue.increment(amount),
            updatedAt: new Date()
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating wallet balance:', error);
        // If user document doesn't exist, this will fail. 
        // In that case, we might need to set it, but user should exist.
        throw error;
    }
}

export default {
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    createTransaction,
    getUserTransactions,
    updateTransactionStatus,
    getTransactionByReference,
    getUserWallet,
    addPaymentMethod,
    updateWalletBalance
};
