// Test Deriv API Connection
import WebSocket from 'ws';

const API_TOKEN = 'NblceB6wqh1pvYK';
const APP_ID = '1089';

console.log('🔌 Testing Deriv API Connection...');
console.log(`Token: ${API_TOKEN.substring(0, 4)}...`);
console.log(`Token Length: ${API_TOKEN.length}`);

const ws = new WebSocket(`wss://ws.derivws.com/websockets/v3?app_id=${APP_ID}`);

ws.on('open', () => {
    console.log('✅ WebSocket Connected');
    console.log('🔐 Attempting Authorization...');

    // Send authorization request
    ws.send(JSON.stringify({
        authorize: API_TOKEN,
        req_id: 1
    }));
});

ws.on('message', (data) => {
    const response = JSON.parse(data.toString());
    console.log('\n📨 Response:', JSON.stringify(response, null, 2));

    if (response.error) {
        console.error('\n❌ Error:', response.error.message);
        console.error('Error Code:', response.error.code);
        ws.close();
        process.exit(1);
    }

    if (response.authorize) {
        console.log('\n✅ Authorization Successful!');
        console.log('Account ID:', response.authorize.loginid);
        console.log('Currency:', response.authorize.currency);
        console.log('Balance:', response.authorize.balance);

        // Request balance
        ws.send(JSON.stringify({
            balance: 1,
            req_id: 2
        }));
    }

    if (response.balance) {
        console.log('\n💰 Balance:', response.balance.balance, response.balance.currency);
        ws.close();
        process.exit(0);
    }
});

ws.on('error', (error) => {
    console.error('❌ WebSocket Error:', error.message);
    process.exit(1);
});

ws.on('close', () => {
    console.log('\n🔌 Connection Closed');
});

// Timeout after 10 seconds
setTimeout(() => {
    console.error('\n⏱️ Timeout: Connection took too long');
    ws.close();
    process.exit(1);
}, 10000);
