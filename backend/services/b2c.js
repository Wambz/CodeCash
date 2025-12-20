import axios from 'axios';
import mpesaAuth from './mpesaAuth.js';

class B2CService {
    constructor() {
        this.environment = process.env.MPESA_ENV || 'sandbox';
        this.shortcode = process.env.MPESA_SHORTCODE;
        this.initiatorName = process.env.MPESA_INITIATOR_NAME;
        this.securityCredential = process.env.MPESA_SECURITY_CREDENTIAL;
        this.queueTimeoutUrl = `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/timeout`;
        this.resultUrl = `${process.env.MPESA_CALLBACK_BASE_URL}/api/mpesa/callback/withdraw`;
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

    async initiateTransfer(phoneNumber, amount, remarks = 'Withdrawal from CODECASH') {
        try {
            const token = await mpesaAuth.getAccessToken();
            const formattedPhone = this.formatPhoneNumber(phoneNumber);

            const requestBody = {
                InitiatorName: this.initiatorName,
                SecurityCredential: this.securityCredential,
                CommandID: 'BusinessPayment', // or 'SalaryPayment', 'PromotionPayment'
                Amount: Math.floor(amount), // M-Pesa doesn't support decimals
                PartyA: this.shortcode,
                PartyB: formattedPhone,
                Remarks: remarks,
                QueueTimeOutURL: this.queueTimeoutUrl,
                ResultURL: this.resultUrl,
                Occassion: 'Withdrawal'
            };

            console.log('Initiating B2C transfer:', {
                phone: formattedPhone,
                amount,
                initiator: this.initiatorName
            });

            const response = await axios.post(
                mpesaAuth.getUrls().b2c,
                requestBody,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('B2C response:', response.data);

            return {
                success: true,
                conversationId: response.data.ConversationID,
                originatorConversationId: response.data.OriginatorConversationID,
                responseCode: response.data.ResponseCode,
                responseDescription: response.data.ResponseDescription
            };
        } catch (error) {
            console.error('B2C transfer error:', error.response?.data || error.message);
            throw new Error(error.response?.data?.errorMessage || 'Failed to initiate B2C transfer');
        }
    }
}

const b2cService = new B2CService();
export default b2cService;
