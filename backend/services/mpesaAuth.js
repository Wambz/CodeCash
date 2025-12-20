import axios from 'axios';

// M-Pesa API URLs
const MPESA_URLS = {
    sandbox: {
        auth: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        stkPush: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        b2c: 'https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
        queryStatus: 'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    },
    production: {
        auth: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        stkPush: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
        b2c: 'https://api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest',
        queryStatus: 'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query'
    }
};

class MPesaAuth {
    constructor() {
        this.token = null;
        this.tokenExpiry = null;
        this.environment = process.env.MPESA_ENV || 'sandbox';
        this.consumerKey = process.env.MPESA_CONSUMER_KEY;
        this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    }

    getUrls() {
        return MPESA_URLS[this.environment];
    }

    async getAccessToken() {
        try {
            // Return cached token if still valid
            if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry) {
                console.log('Using cached M-Pesa token');
                return this.token;
            }

            console.log('Fetching new M-Pesa access token...');

            // Generate Basic Auth header
            const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');

            const response = await axios.get(this.getUrls().auth, {
                headers: {
                    'Authorization': `Basic ${auth}`
                }
            });

            this.token = response.data.access_token;
            // M-Pesa tokens expire in 1 hour, cache for 55 minutes to be safe
            this.tokenExpiry = Date.now() + (55 * 60 * 1000);

            console.log('M-Pesa access token obtained successfully');
            return this.token;
        } catch (error) {
            console.error('Error getting M-Pesa access token:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with M-Pesa API');
        }
    }

    clearToken() {
        this.token = null;
        this.tokenExpiry = null;
    }
}

// Singleton instance
const mpesaAuth = new MPesaAuth();

export default mpesaAuth;
