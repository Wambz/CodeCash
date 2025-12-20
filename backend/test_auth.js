import dotenv from 'dotenv';
import axios from 'axios';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Load .env from backend directory
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

console.log('Testing M-Pesa Auth...');
console.log('Environment:', process.env.MPESA_ENV);
console.log('Key:', process.env.MPESA_CONSUMER_KEY ? process.env.MPESA_CONSUMER_KEY.substring(0, 5) + '...' : 'MISSING');
console.log('Secret:', process.env.MPESA_CONSUMER_SECRET ? 'PRESENT' : 'MISSING');

const consumerKey = process.env.MPESA_CONSUMER_KEY;
const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

async function testAuth() {
    try {
        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
        console.log('Auth Header:', `Basic ${auth.substring(0, 10)}...`);

        const response = await axios.get(url, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });

        console.log('Success!', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        console.error('Status:', error.response ? error.response.status : 'N/A');
    }
}

testAuth();
