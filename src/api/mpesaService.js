// Frontend M-Pesa Service - Calls backend API

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000';

export async function initiateDeposit(phoneNumber, amount, userId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/mpesa/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber,
                amount,
                userId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to initiate deposit');
        }

        return data;
    } catch (error) {
        console.error('Deposit initiation error:', error);
        throw error;
    }
}

export async function initiateWithdrawal(phoneNumber, amount, userId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/mpesa/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phoneNumber,
                amount,
                userId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to initiate withdrawal');
        }

        return data;
    } catch (error) {
        console.error('Withdrawal initiation error:', error);
        throw error;
    }
}

export async function checkTransactionStatus(transactionId) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/mpesa/status/${transactionId}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to check status');
        }

        return data;
    } catch (error) {
        console.error('Status check error:', error);
        throw error;
    }
}

// Poll transaction status until completion
export async function pollTransactionStatus(transactionId, maxAttempts = 30, interval = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            const result = await checkTransactionStatus(transactionId);

            if (result.success && result.transaction) {
                const status = result.transaction.status;

                // Return if completed (success or failed)
                if (status === 'success' || status === 'failed') {
                    return result.transaction;
                }
            }

            // Wait before next attempt
            await new Promise(resolve => setTimeout(resolve, interval));
        } catch (error) {
            // Continue polling even if status check fails
            console.log(`Status check attempt ${attempt + 1} failed, retrying...`);
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    // Timeout - return pending status
    return {
        status: 'timeout',
        message: 'Transaction status check timed out. Please check your M-Pesa messages.'
    };
}
