import WebSocket from 'ws';
import dotenv from 'dotenv';
dotenv.config();

class DerivService {
    constructor() {
        this.appId = 1089;
        this.wsUrl = 'wss://ws.derivws.com/websockets/v3';
        this.agentToken = process.env.DERIV_AGENT_TOKEN;
    }

    /**
     * Helper to create a promise-based WebSocket request
     */
    async sendRequest(request, token = null) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`${this.wsUrl}?app_id=${this.appId}`);

            ws.on('open', () => {
                const sendPayload = () => {
                    ws.send(JSON.stringify(request));
                };

                if (token) {
                    // Authorize first if token provided
                    ws.send(JSON.stringify({ authorize: token }));
                } else {
                    sendPayload();
                }
            });

            ws.on('message', (data) => {
                const response = JSON.parse(data);

                if (response.error) {
                    ws.close();
                    reject(response.error);
                }

                if (response.msg_type === 'authorize') {
                    // Auth successful, send actual request
                    ws.send(JSON.stringify(request));
                } else if (response.msg_type === request.req_type || (request.paymentagent_transfer && response.msg_type === 'paymentagent_transfer') || (request.get_account_status && response.msg_type === 'get_account_status')) {
                    ws.close();
                    resolve(response);
                }
            });

            ws.on('error', (err) => {
                reject(err);
            });
        });
    }

    /**
     * Get User's Account CR Number using their token
     */
    async getAccountDetails(userToken) {
        try {
            // We authorize as the user to get their details
            const response = await this.sendRequest({ get_account_status: 1 }, userToken);
            // The authorize response itself contains the loginid (CR number)
            // But we need to capture it from the authorize step or separate call
            // Actually, simply authorizing returns the account list and current loginid
            return this.resolveLoginId(userToken);
        } catch (error) {
            console.error('DerivService: Failed to get account details', error);
            throw error;
        }
    }

    /**
     * Dedicated method just to get loginid from authorization
     */
    async resolveLoginId(userToken) {
        return new Promise((resolve, reject) => {
            const ws = new WebSocket(`${this.wsUrl}?app_id=${this.appId}`);

            ws.on('open', () => {
                ws.send(JSON.stringify({ authorize: userToken }));
            });

            ws.on('message', (data) => {
                const response = JSON.parse(data);
                if (response.error) {
                    ws.close();
                    reject(response.error);
                }
                if (response.msg_type === 'authorize') {
                    ws.close();
                    resolve({
                        loginid: response.authorize.loginid,
                        email: response.authorize.email,
                        fullname: response.authorize.fullname
                    });
                }
            });
        });
    }

    /**
     * Transfer funds as a Payment Agent
     * @param {string} recipientCR - The user's CR login ID (e.g. CR123456)
     * @param {number} amount - Amount in USD
     * @param {string} description - Transaction description
     */
    async transferFunds(recipientCR, amount, description = 'CodeCash Deposit') {
        if (!this.agentToken) {
            throw new Error('DERIV_AGENT_TOKEN is not configured manually in backend');
        }

        console.log(`DerivService: Initiating transfer of ${amount} USD to ${recipientCR}`);

        try {
            const request = {
                paymentagent_transfer: 1,
                transfer_to: recipientCR,
                currency: 'USD',
                amount: amount,
                description: description,
                dry_run: 0
            };

            // This executes as the Agent (using agentToken)
            const response = await this.sendRequest(request, this.agentToken);

            if (response.paymentagent_transfer === 1) {
                return {
                    success: true,
                    ...response.paymentagent_transfer_result
                };
            } else if (response.paymentagent_transfer === 2) {
                // Dry run success (if we used dry_run=1)
                return { success: true, dry_run: true };
            }

            return { success: false, response };

        } catch (error) {
            console.error('DerivService: Transfer failed', error);
            return {
                success: false,
                error: error.message || error.code
            };
        }
    }
}

const derivService = new DerivService();
export default derivService;
