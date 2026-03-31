import fs from 'fs';
import util from 'util';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create a write stream (in ESM, we can't just require)
// But to keep it simple, let's just use console.log and stream it to a file using shell redirection if needed,
// OR just use fs.appendFileSync for simplicity in the override.

const logFile = 'simulation.log';
// Clear log file
fs.writeFileSync(logFile, '');

const originalLog = console.log;
const originalError = console.error;

console.log = function (...args) {
    const msg = util.format(...args);
    fs.appendFileSync(logFile, msg + '\n');
    originalLog.apply(console, args);
};

console.error = function (...args) {
    const msg = util.format(...args);
    fs.appendFileSync(logFile, msg + '\n');
    originalError.apply(console, args);
};


// CONFIG
const BACKEND_URL = 'http://localhost:5000';
// You must have a real user ID in Firestore that has a VALID derivToken
const USER_ID = '1';
const PHONE_NUMBER = '254712345678';
const AMOUNT_USD = 3; // $3 (Minimum)
const AMOUNT_KSH = 399; // 3 * 133

async function runTest() {
    console.log('=== SIMULATING DERIV DEPOSIT FLOW ===');

    // 1. Initiate Deposit (to create a transaction record in memory/DB)
    console.log('\nSTEP 1: Initiating Deriv Deposit...');
    try {
        const initRes = await fetch(`${BACKEND_URL}/api/mpesa/deriv-deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: PHONE_NUMBER,
                amountUSD: AMOUNT_USD,
                userId: USER_ID
            })
        });
        const initData = await initRes.json();
        console.log('Initiate Response:', initData);

        if (!initData.success) {
            console.error('Failed to initiate.');
            return;
        }

        const checkoutRequestId = initData.checkoutRequestId;
        console.log(`\nTransaction Created with ID: ${checkoutRequestId}`);

        // 2. Simulate M-Pesa Callback (Success)
        console.log('\nSTEP 2: Simulating M-Pesa Callback...');

        const callbackPayload = {
            Body: {
                stkCallback: {
                    MerchantRequestID: initData.merchantRequestId,
                    CheckoutRequestID: checkoutRequestId,
                    ResultCode: 0,
                    ResultDesc: 'The service request is processed successfully.',
                    CallbackMetadata: {
                        Item: [
                            { Name: 'Amount', Value: AMOUNT_KSH },
                            { Name: 'MpesaReceiptNumber', Value: 'TEST_RECEIPT_123' },
                            { Name: 'TransactionDate', Value: 20240101120000 },
                            { Name: 'PhoneNumber', Value: PHONE_NUMBER }
                        ]
                    }
                }
            }
        };

        const callbackRes = await fetch(`${BACKEND_URL}/api/mpesa/callback/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(callbackPayload)
        });

        const callbackText = await callbackRes.text();
        console.log('Callback Response:', callbackText);

        // 3. Check Status (Polling)
        console.log('\nSTEP 3: Checking Transaction Status...');

        let attempts = 0;
        const maxAttempts = 5;

        const checkStatus = async () => {
            attempts++;
            const statusRes = await fetch(`${BACKEND_URL}/api/mpesa/status/${checkoutRequestId}`);
            console.log(`[Attempt ${attempts}] HTTP Status: ${statusRes.status}`);

            const statusData = await statusRes.json();
            console.log(`[Attempt ${attempts}] Response Body:`, JSON.stringify(statusData));

            if (statusData.status === 'completed') {
                console.log('\n✅ SUCCESS: Transaction status is "completed" (Deriv transfer done)');
                return true;
            } else if (statusData.status === 'deriv-failed') {
                console.log('\n❌ PARTIAL SUCCESS: Transaction status is "deriv-failed" (M-Pesa ok, Deriv failed)');
                return true;
            } else if (statusData.status === 'failed') {
                console.log('\n❌ FAILED: Transaction failed.');
                return true;
            }

            if (attempts < maxAttempts) {
                setTimeout(checkStatus, 2000);
            } else {
                console.log('\n⚠️ TIMEOUT: Status did not reach final state.');
            }
        };

        // Wait a bit for backend to process callback async
        setTimeout(checkStatus, 2000);

    } catch (error) {
        console.error('Test Error:', error);
    }
}

runTest();
