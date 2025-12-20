// Deriv API Service using WebSocket
class DerivAPI {
    constructor(apiToken) {
        this.apiToken = apiToken;
        this.ws = null;
        this.requestId = 0;
        this.callbacks = new Map();
        this.isConnected = false;
        this.balance = 0;
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket('wss://ws.derivws.com/websockets/v3?app_id=1089');

                this.ws.onopen = () => {
                    console.log('Deriv WebSocket connected');
                    this.isConnected = true;
                    // Authorize immediately after connection
                    this.authorize().then(resolve).catch(reject);
                };

                this.ws.onmessage = (event) => {
                    const response = JSON.parse(event.data);
                    console.log('Deriv API Response:', response);

                    // Handle balance updates
                    if (response.msg_type === 'balance') {
                        this.balance = parseFloat(response.balance.balance);
                    }

                    // Handle callbacks
                    if (response.req_id && this.callbacks.has(response.req_id)) {
                        const callback = this.callbacks.get(response.req_id);
                        if (response.error) {
                            callback.reject(response.error);
                        } else {
                            callback.resolve(response);
                        }
                        this.callbacks.delete(response.req_id);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('Deriv WebSocket error:', error);
                    reject(error);
                };

                this.ws.onclose = () => {
                    console.log('Deriv WebSocket disconnected');
                    this.isConnected = false;
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    send(request) {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                reject(new Error('WebSocket not connected'));
                return;
            }

            this.requestId++;
            request.req_id = this.requestId;

            this.callbacks.set(this.requestId, { resolve, reject });
            this.ws.send(JSON.stringify(request));

            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.callbacks.has(this.requestId)) {
                    this.callbacks.delete(this.requestId);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }

    async authorize() {
        const response = await this.send({
            authorize: this.apiToken
        });

        if (response.authorize) {
            console.log('Authorized:', response.authorize);
            // Subscribe to balance updates
            await this.subscribeToBalance();
            return response.authorize;
        }
        throw new Error('Authorization failed');
    }

    async subscribeToBalance() {
        return this.send({
            balance: 1,
            subscribe: 1
        });
    }

    async getBalance() {
        const response = await this.send({
            balance: 1
        });

        if (response.balance) {
            this.balance = parseFloat(response.balance.balance);
            return this.balance;
        }
        throw new Error('Failed to get balance');
    }

    async getAccountInfo() {
        const response = await this.send({
            get_account_status: 1
        });
        return response.get_account_status;
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }
}

// Singleton instance
let derivAPIInstance = null;

export async function initializeDerivAPI(apiToken) {
    if (!derivAPIInstance) {
        derivAPIInstance = new DerivAPI(apiToken);
        await derivAPIInstance.connect();
    }
    return derivAPIInstance;
}

export function getDerivAPI() {
    return derivAPIInstance;
}

export async function getBalances() {
    try {
        if (!derivAPIInstance || !derivAPIInstance.isConnected) {
            // Initialize with token from environment or use provided token
            const token = import.meta.env.VITE_DERIV_API_TOKEN || '***********3bVg';
            await initializeDerivAPI(token);
        }

        const derivBalance = await derivAPIInstance.getBalance();

        // For M-Pesa, we'll use a mock value since we don't have M-Pesa API yet
        return {
            mpesa: 1000.0, // Mock M-Pesa balance
            deriv: derivBalance
        };
    } catch (error) {
        console.error('Error fetching balances:', error);
        // Fallback to mock data if API fails
        return {
            mpesa: 1000.0,
            deriv: 500.0
        };
    }
}

export async function processTransaction({ type, amount }) {
    try {
        if (!derivAPIInstance || !derivAPIInstance.isConnected) {
            const token = import.meta.env.VITE_DERIV_API_TOKEN || '***********3bVg';
            await initializeDerivAPI(token);
        }

        // Simulate network latency
        await new Promise(res => setTimeout(res, 800));

        // For now, we'll simulate the transaction since we need M-Pesa integration
        // In production, you would:
        // 1. For deposit: Deduct from M-Pesa, then deposit to Deriv
        // 2. For withdraw: Withdraw from Deriv, then credit to M-Pesa

        // Get current balance
        const currentBalance = await derivAPIInstance.getBalance();

        // Validate transaction
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }

        if (type === 'deposit') {
            // In production: Call M-Pesa API to deduct amount
            // Then deposit to Deriv (Deriv API doesn't support direct deposits via API)
            // For now, we'll just return updated balances
            console.log(`Simulating deposit of $${amount} to Deriv`);
        } else if (type === 'withdraw') {
            // Check if sufficient balance
            if (currentBalance < amount) {
                throw new Error('Insufficient Deriv balance');
            }
            // In production: Withdraw from Deriv, then credit to M-Pesa
            console.log(`Simulating withdrawal of $${amount} from Deriv`);
        } else {
            throw new Error('Invalid transaction type');
        }

        // Return simulated balances
        // Note: Real implementation would update after actual transactions
        const newBalances = {
            mpesa: type === 'deposit' ? 1000 - amount : 1000 + amount,
            deriv: type === 'deposit' ? currentBalance + amount : currentBalance - amount
        };

        return { balances: newBalances };
    } catch (error) {
        console.error('Transaction error:', error);
        throw error;
    }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        if (derivAPIInstance) {
            derivAPIInstance.disconnect();
        }
    });
}
