import axios from 'axios';
import mpesaAuth from './mpesaAuth.js';

class STKPushService {
    constructor() {
        this.environment = process.env.MPESA_ENV || 'sandbox';
        this.shortcode = process.env.MPESA_SHORTCODE;
        this.passkey = process.env.MPESA_PASSKEY;
        this.callbackUrl = `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/callback/deposit`;
    }

    generatePassword(timestamp) {
        // Password = Base64(Shortcode + Passkey + Timestamp)
        const str = `${this.shortcode}${this.passkey}${timestamp}`;
        return Buffer.from(str).toString('base64');
    }

    generateTimestamp() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}${month}${day}${hours}${minutes}${seconds}`;
    }

    formatPhoneNumber(phone) {
        // Convert to format 254XXXXXXXXX
        let formatted = phone.replace(/\s+/g, '');

        if (formatted.startsWith('0')) {
            formatted = '254' + formatted.substring(1);
        } else if (formatted.startsWith('+254')) {
            formatted = formatted.substring(1);
        } else if (formatted.startsWith('254')) {
            // Already in correct format
        } else {
            formatted = '254' + formatted;
        }

        return formatted;
    }

    async initiatePush(phoneNumber, amount, accountReference = 'CODECASH') {
        try {
            const token = await mpesaAuth.getAccessToken();
            const timestamp = this.generateTimestamp();
            const password = this.generatePassword(timestamp);
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const requestBody = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                TransactionType: 'CustomerPayBillOnline',
                Amount: Math.floor(amount), // M-Pesa doesn't support decimals
                PartyA: formattedPhone,
                PartyB: this.shortcode,
                PhoneNumber: formattedPhone,
                CallBackURL: this.callbackUrl,
                AccountReference: accountReference,
                TransactionDesc: `Deposit to ${accountReference}`
            };

            console.log('Initiating STK Push:', {
                phone: formattedPhone,
                amount,
                timestamp
            });

            const response = await axios.post(
                mpesaAuth.getUrls().stkPush,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('STK Push response:', response.data);

            return {
                success: true,
                checkoutRequestId: response.data.CheckoutRequestID,
                merchantRequestId: response.data.MerchantRequestID,
                responseCode: response.data.ResponseCode,
                responseDescription: response.data.ResponseDescription,
                customerMessage: response.data.CustomerMessage
            };
        } catch (error) {
            console.error('STK Push error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.errorMessage || 'Failed to initiate STK Push');
        }
    }

    async queryStatus(checkoutRequestId) {
        try {
            const token = await mpesaAuth.getAccessToken();
            const timestamp = this.generateTimestamp();
            const password = this.generatePassword(timestamp);

            const requestBody = {
                BusinessShortCode: this.shortcode,
                Password: password,
                Timestamp: timestamp,
                CheckoutRequestID: checkoutRequestId
            };

            const response = await axios.post(
                mpesaAuth.getUrls().queryStatus,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Query status error:', error.response?.data || error.message);
            throw new Error('Failed to query transaction status');
        }
    }
}

const stkPushService = new STKPushService();
export default stkPushService;
