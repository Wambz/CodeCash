import express from 'express';
import { verifyToken } from './authRoutes.js';
import {
    createTransaction,
    getUserTransactions
} from '../services/firestore.service.js';

const router = express.Router();

// Get History for a User
router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const { userId } = req.params;

        // Ensure user can only access their own transactions
        if (req.user.uid !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const transactions = await getUserTransactions(userId);

        // Map to match frontend expectations
        const history = transactions.map(tx => ({
            type: tx.type,
            amount: tx.amount,
            status: tx.status,
            timestamp: tx.timestamp?.toDate ? tx.timestamp.toDate() : tx.timestamp,
            id: tx.id,
            referenceId: tx.referenceId
        }));

        res.json({ success: true, history });
    } catch (err) {
        console.error('Get transactions error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
});

// Record User Transaction
router.post('/', verifyToken, async (req, res) => {
    try {
        const { userId, type, amount, status, referenceId } = req.body;

        // Ensure user can only create transactions for themselves
        if (req.user.uid !== userId) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const result = await createTransaction({
            userId,
            type,
            amount,
            status,
            referenceId: referenceId || null
        });

        res.status(201).json({
            success: true,
            message: 'Transaction recorded',
            transactionId: result.id
        });
    } catch (err) {
        console.error('Create transaction error:', err);
        res.status(500).json({ success: false, message: 'Failed to record transaction' });
    }
});

export default router;
