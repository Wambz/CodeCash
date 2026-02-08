import fetch from 'node-fetch';

const BASE_URL = 'http://127.0.0.1:5000/api';
const userId = 'test_wallet_user_' + Date.now();

async function testWalletApi() {
    console.log('Testing Wallet API...');

    // 1. Get Wallet (should be empty/default)
    console.log(`\n1. Fetching wallet for ${userId}...`);
    let res = await fetch(`${BASE_URL}/wallet/${userId}`);
    let data = await res.json();
    console.log('Get Wallet Response:', JSON.stringify(data, null, 2));

    if (!data.success || data.wallet.balance !== 0) {
        console.error('❌ Failed to get initial wallet');
        return;
    }

    // 2. Add Payment Method
    console.log('\n2. Adding payment method...');
    const method = {
        type: 'M-Pesa',
        phone: '0712345678',
        id: '**** 5678',
        addedAt: new Date().toISOString()
    };

    res = await fetch(`${BASE_URL}/wallet/payment-method`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, method })
    });
    data = await res.json();
    console.log('Add Method Response:', JSON.stringify(data, null, 2));

    if (!data.success) {
        console.error('❌ Failed to add payment method');
        return;
    }

    // 3. Verify Payment Method in Wallet
    console.log('\n3. Verifying wallet update...');
    res = await fetch(`${BASE_URL}/wallet/${userId}`);
    data = await res.json();
    console.log('Get Wallet Response:', JSON.stringify(data, null, 2));

    if (data.wallet.paymentMethods && data.wallet.paymentMethods.length > 0) {
        console.log('✅ Wallet API verified successfully!');
    } else {
        console.error('❌ Payment method not found in wallet');
    }
}

testWalletApi();
