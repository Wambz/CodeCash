import express from 'express';
import { sql, poolPromise } from '../config/db.js';

const router = express.Router();

// Get History for a User
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const pool = await poolPromise;
        if (!pool) return res.json({ success: true, history: [] });

        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .query('SELECT * FROM Transactions WHERE UserId = @UserId ORDER BY Timestamp DESC');

        // Map SQL result to match frontend expectations
        const history = result.recordset.map(record => ({
            type: record.Type,
            amount: record.Amount,
            status: record.Status,
            timestamp: record.Timestamp,
            id: record.Id
        }));

        res.json({ success: true, history });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to fetch history' });
    }
});

// Record User Transaction
router.post('/', async (req, res) => {
    try {
        const { userId, type, amount, status, referenceId } = req.body;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(201).json({ success: true, message: 'Transaction recorded (local only)' });
        }

        await pool.request()
            .input('UserId', sql.Int, userId)
            .input('Type', sql.NVarChar, type)
            .input('Amount', sql.Decimal(18, 2), amount)
            .input('Status', sql.NVarChar, status)
            .input('ReferenceId', sql.NVarChar, referenceId || null)
            .query('INSERT INTO Transactions (UserId, Type, Amount, Status, ReferenceId) VALUES (@UserId, @Type, @Amount, @Status, @ReferenceId)');

        res.status(201).json({ success: true, message: 'Transaction recorded' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to record transaction' });
    }
});

export default router;
