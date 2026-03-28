import express from 'express';
import stkPushService from '../services/stkPush.js';
import b2cService from '../services/b2c.js';
import { createTransaction, updateTransactionStatus } from '../services/firestore.service.js';

const router = express.Router();

// In-memory storage for transaction status (use database in production)
const transactions = new Map();

// Deposit endpoint - Initiates STK Push
router.post('/deposit', async (req, res) => {
    try {
        const { phoneNumber, amount, userId } = req.body;

        if (!phoneNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and amount are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        console.log(`Deposit request: ${phoneNumber}, KES ${amount}`);

        const result = await stkPushService.initiatePush(phoneNumber, amount);

        // Store transaction with pending status
        transactions.set(result.checkoutRequestId, {
            type: 'deposit',
            phoneNumber,
            amount,
            userId,
            status: 'pending',
            checkoutRequestId: result.checkoutRequestId,
            merchantRequestId: result.merchantRequestId,
            timestamp: new Date()
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('STK Push Error Details:', error.response ? error.response.data : error.message);
        console.error('Full Error:', error);
        res.status(500).json({ success: false, message: 'Failed to initiate STK Push', error: error.message });
    }
});

// Withdrawal endpoint - Initiates B2C transfer
router.post('/withdraw', async (req, res) => {
    try {
        const { phoneNumber, amount, userId } = req.body;

        if (!phoneNumber || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and amount are required'
            });
        }

        if (amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
        }

        console.log(`Withdrawal request: ${phoneNumber}, KES ${amount}`);

        const result = await b2cService.initiateTransfer(phoneNumber, amount);

        // Store transaction with pending status
        transactions.set(result.conversationId, {
            type: 'withdraw',
            phoneNumber,
            amount,
            userId,
            status: 'pending',
            conversationId: result.conversationId,
            originatorConversationId: result.originatorConversationId,
            timestamp: new Date()
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Withdrawal error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// STK Push callback
router.post('/callback/deposit', (req, res) => {
    console.log('=== STK Push Callback Received ===');
    console.log(JSON.stringify(req.body, null, 2));

    try {
        const { Body } = req.body;
        const { stkCallback } = Body;

        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;
        const resultDesc = stkCallback.ResultDesc;

        // Update transaction status
        if (transactions.has(checkoutRequestId)) {
            const transaction = transactions.get(checkoutRequestId);

            if (resultCode === 0) {
                // Success
                transaction.status = 'success';
                transaction.mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item?.find(
                    item => item.Name === 'MpesaReceiptNumber'
                )?.Value;
            } else {
                // Failed
                transaction.status = 'failed';
                transaction.error = resultDesc;
            }

            transaction.resultCode = resultCode;
            transaction.resultDesc = resultDesc;
            transaction.completedAt = new Date();

            console.log(`Transaction ${checkoutRequestId} updated:`, transaction.status);
        }

        // Acknowledge callback
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        console.error('Callback processing error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
    }
});

// B2C callback
router.post('/callback/withdraw', (req, res) => {
    console.log('=== B2C Callback Received ===');
    console.log(JSON.stringify(req.body, null, 2));

    try {
        const { Result } = req.body;
        const conversationId = Result.ConversationID;
        const resultCode = Result.ResultCode;
        const resultDesc = Result.ResultDesc;

        // Update transaction status
        if (transactions.has(conversationId)) {
            const transaction = transactions.get(conversationId);

            if (resultCode === 0) {
                // Success
                transaction.status = 'success';
                transaction.transactionId = Result.TransactionID;
            } else {
                // Failed
                transaction.status = 'failed';
                transaction.error = resultDesc;
            }

            transaction.resultCode = resultCode;
            transaction.resultDesc = resultDesc;
            transaction.completedAt = new Date();

            console.log(`Transaction ${conversationId} updated:`, transaction.status);
        }

        // Acknowledge callback
        res.json({ ResultCode: 0, ResultDesc: 'Success' });
    } catch (error) {
        console.error('B2C callback processing error:', error);
        res.json({ ResultCode: 1, ResultDesc: 'Error processing callback' });
    }
});

// Timeout callback
router.post('/timeout', (req, res) => {
    console.log('=== Timeout Callback Received ===');
    console.log(JSON.stringify(req.body, null, 2));
    res.json({ ResultCode: 0, ResultDesc: 'Timeout received' });
});

// Query transaction status
router.get('/status/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (transactions.has(id)) {
            const transaction = transactions.get(id);

            // If status is pending, try to query M-Pesa for an update
            if (transaction.status === 'pending') {
                try {
                    console.log(`Transaction ${id} is pending, querying M-Pesa...`);
                    const result = await stkPushService.queryStatus(id);

                    const resultCode = String(result.ResultCode);
                    console.log(`Query result for ${id}: ResultCode=${resultCode}, ResultDesc=${result.ResultDesc}`);

                    if (resultCode === '0') {
                        transaction.status = 'success';
                        transaction.resultCode = resultCode;
                        transaction.resultDesc = result.ResultDesc;
                        transaction.completedAt = new Date();
                        console.log(`Transaction ${id} updated via query: success`);

                        // RECORD TO DATABASE
                        try {
                            const transactionData = {
                                userId: transaction.userId,
                                type: transaction.type,
                                amount: transaction.amount,
                                status: 'success',
                                referenceId: transaction.checkoutRequestId || transaction.conversationId,
                                mpesaReceiptNumber: transaction.mpesaReceiptNumber || result.ResultDesc,
                                timestamp: new Date()
                            };

                            const txResult = await createTransaction(transactionData);
                            console.log(`Transaction ${id} recorded to Firestore with ID: ${txResult.id}`);
                        } catch (dbErr) {
                            console.error('Failed to record transaction to Firestore:', dbErr.message);
                        }
                    } else if (result.ResultDesc?.includes('still under processing') || result.ResultDesc?.includes('pending') || result.errorCode === '500.001.1001') {
                        // Keep it as pending — user hasn't entered PIN yet
                        console.log(`Transaction ${id} is still under processing by Safaricom.`);
                    } else if (resultCode === '1032') {
                        // User cancelled the STK Push
                        transaction.status = 'failed';
                        transaction.resultCode = resultCode;
                        transaction.resultDesc = 'Transaction cancelled by user.';
                        transaction.completedAt = new Date();
                        console.log(`Transaction ${id}: cancelled by user`);
                    } else {
                        // Other failure — but only mark as failed if it's a definitive error
                        transaction.status = 'failed';
                        transaction.resultCode = resultCode;
                        transaction.resultDesc = result.ResultDesc || 'Transaction failed. Please try again.';
                        transaction.completedAt = new Date();
                        console.log(`Transaction ${id} updated via query: failed (${result.ResultDesc})`);
                    }
                    // If it's still processing, M-Pesa might return specific code or we just leave it as pending.
                    // For simply, if we get a result, we assume it's final unless it explicitly says processing.
                } catch (error) {
                    // Ignore query errors (maybe it's too early, or network issue)
                    // Just log and return the current pending status
                    console.log(`Failed to query status for ${id}: ${error.message}`);
                }
            }

            res.json({
                success: true,
                transaction
            });
        } else {
            // Try querying M-Pesa directly for STK Push
            try {
                const result = await stkPushService.queryStatus(id);
                res.json({
                    success: true,
                    transaction: {
                        checkoutRequestId: id,
                        status: String(result.ResultCode) === '0' ? 'success' : 'failed',
                        resultCode: result.ResultCode,
                        resultDesc: result.ResultDesc
                    }
                });
            } catch (error) {
                res.status(404).json({
                    success: false,
                    message: 'Transaction not found'
                });
            }
        }
    } catch (error) {
        console.error('Status query error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get all transactions (for debugging)
router.get('/transactions', (req, res) => {
    const allTransactions = Array.from(transactions.values());
    res.json({
        success: true,
        transactions: allTransactions
    });
});

export default router;
