import express from 'express';
import stkPushService from '../services/stkPush.js';
import b2cService from '../services/b2c.js';
import { createTransaction, updateTransactionStatus, updateWalletBalance, getUserProfile } from '../services/firestore.service.js';
import derivService from '../services/deriv.js';

const router = express.Router();

// ==================== CONSTANTS ====================
const CODECASH_RATE = 133.00; // Fixed KSH per USD rate charged to users
const DERIV_DEPOSIT_URL = 'https://app.deriv.com/cashier/deposit?account=USD';

// In-memory storage for transaction status (use database in production)
const transactions = new Map();

// ==================== DERIV DEPOSIT ====================
// Collects KSH via M-Pesa at fixed 133 KSH/USD rate, then redirects user to Deriv cashier
router.post('/deriv-deposit', async (req, res) => {
    try {
        const { phoneNumber, amountUSD, userId } = req.body;

        if (!phoneNumber || !amountUSD) {
            return res.status(400).json({
                success: false,
                message: 'Phone number and USD amount are required'
            });
        }

        const usdAmount = parseFloat(amountUSD);
        if (isNaN(usdAmount) || usdAmount < 3) {
            return res.status(400).json({
                success: false,
                message: 'Minimum deposit is 3 USD'
            });
        }

        // Convert USD to KSH at CodeCash fixed rate
        const amountKSH = Math.ceil(usdAmount * CODECASH_RATE);

        console.log(`[Deriv Deposit] User ${userId}: $${usdAmount} USD → ${amountKSH} KSH @ ${CODECASH_RATE} KSH/USD`);

        const result = await stkPushService.initiatePush(phoneNumber, amountKSH);

        // Store transaction with deriv-deposit metadata
        transactions.set(result.checkoutRequestId, {
            type: 'deriv-deposit',
            phoneNumber,
            amount: amountKSH,
            amountUSD: usdAmount,
            amountKSH,
            exchangeRate: CODECASH_RATE,
            derivDepositUrl: DERIV_DEPOSIT_URL,
            userId,
            status: 'pending',
            checkoutRequestId: result.checkoutRequestId,
            merchantRequestId: result.merchantRequestId,
            timestamp: new Date()
        });

        res.json({
            success: true,
            ...result,
            amountKSH,
            amountUSD: usdAmount,
            exchangeRate: CODECASH_RATE,
            derivDepositUrl: DERIV_DEPOSIT_URL
        });
    } catch (error) {
        console.error('[Deriv Deposit] Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Failed to initiate Deriv deposit', error: error.message });
    }
});

// ==================== STANDARD DEPOSIT ====================
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
router.post('/callback/deposit', async (req, res) => {
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
                if (transaction.status !== 'success') {
                    transaction.status = 'success';
                    transaction.mpesaReceiptNumber = stkCallback.CallbackMetadata?.Item?.find(
                        item => item.Name === 'MpesaReceiptNumber'
                    )?.Value;

                    // RECORD TO DATABASE
                    try {
                        const transactionData = {
                            userId: transaction.userId,
                            type: transaction.type || 'deposit',
                            amount: transaction.amount,
                            amountUSD: transaction.amountUSD, // Include USD amount for deriv-deposit
                            exchangeRate: transaction.exchangeRate,
                            status: 'success',
                            referenceId: checkoutRequestId,
                            mpesaReceiptNumber: transaction.mpesaReceiptNumber,
                            timestamp: new Date()
                        };

                        const txResult = await createTransaction(transactionData);
                        console.log(`Callback: Transaction ${checkoutRequestId} recorded to Firestore with ID: ${txResult.id}`);

                        // Only update wallet balance for standard deposits
                        if (transaction.type === 'deposit') {
                            await updateWalletBalance(transaction.userId, transaction.amount);
                            console.log(`Callback: Wallet balance updated for user ${transaction.userId} by ${transaction.amount}`);
                        } else if (transaction.type === 'deriv-deposit') {
                            // AUTOMATED DERIV TRANSFER
                            let derivFinalStatus = 'deriv-failed'; // default to failed
                            try {
                                console.log(`Callback: Initiating Deriv Transfer for User ${transaction.userId}`);

                                // 1. Get User Profile for Token
                                const userProfile = await getUserProfile(transaction.userId);

                                if (userProfile && userProfile.derivToken) {
                                    // 2. Resolve CR Number
                                    console.log(`Callback: Resolving Deriv CR for token...`);
                                    const derivAccount = await derivService.getAccountDetails(userProfile.derivToken);

                                    if (derivAccount && derivAccount.loginid) {
                                        console.log(`Callback: Resolved CR Number: ${derivAccount.loginid}. Initiating transfer of $${transaction.amountUSD}...`);

                                        // 3. Execute Transfer
                                        const transferResult = await derivService.transferFunds(derivAccount.loginid, transaction.amountUSD);

                                        if (transferResult.success) {
                                            console.log(`Callback: Deriv Transfer Success:`, transferResult);
                                            derivFinalStatus = 'completed';
                                        } else {
                                            console.error(`Callback: Deriv Transfer Failed:`, transferResult);
                                        }
                                    } else {
                                        console.error('Callback: Failed to resolve Deriv CR number from token.');
                                    }
                                } else {
                                    console.log(`Callback: User ${transaction.userId} has no Deriv Token. Manual deposit required.`);
                                    derivFinalStatus = 'success'; // keep as M-Pesa success, no token to try
                                }
                            } catch (derivErr) {
                                console.error('Callback: Deriv Automation Error:', derivErr);
                            }

                            // ALWAYS update in-memory status (polling reads from this)
                            transaction.status = derivFinalStatus;
                            console.log(`Callback: Deriv automation result → ${derivFinalStatus}`);

                            // Try to update Firestore (non-blocking)
                            try {
                                await updateTransactionStatus(checkoutRequestId, derivFinalStatus);
                            } catch (fsErr) {
                                console.error('Callback: Firestore status update failed (non-critical):', fsErr.message);
                            }
                        } else {
                            console.log(`Callback: Skipped wallet balance update for ${transaction.type} transaction`);
                        }

                    } catch (dbErr) {
                        console.error('Callback: Failed to record transaction/balance:', dbErr.message);
                    }
                }
            } else {
                // Failed
                transaction.status = 'failed';
                transaction.error = resultDesc;
            }

            transaction.resultCode = resultCode;
            transaction.resultDesc = resultDesc;
            transaction.completedAt = new Date();

            console.log(`Transaction ${checkoutRequestId} updated via callback:`, transaction.status);
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
                                type: transaction.type || 'deposit',
                                amount: transaction.amount,
                                amountUSD: transaction.amountUSD,
                                exchangeRate: transaction.exchangeRate,
                                status: 'success',
                                referenceId: transaction.checkoutRequestId || transaction.conversationId,
                                mpesaReceiptNumber: transaction.mpesaReceiptNumber || result.ResultDesc,
                                timestamp: new Date()
                            };

                            const txResult = await createTransaction(transactionData);
                            console.log(`Transaction ${id} recorded to Firestore with ID: ${txResult.id}`);

                            // Only update wallet balance for standard deposits
                            if (transaction.type === 'deposit') {
                                await updateWalletBalance(transaction.userId, transaction.amount);
                                console.log(`Wallet balance updated for user ${transaction.userId} by ${transaction.amount}`);
                            } else {
                                console.log(`Skipped wallet balance update for ${transaction.type} transaction`);
                            }

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
