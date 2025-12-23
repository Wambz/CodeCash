// Deriv API Service using WebSocket
class DerivAPI {
    constructor(apiToken) {
        // Sanitize token: remove whitespace and potential quotes
        this.apiToken = apiToken ? String(apiToken).trim().replace(/^['"]|['"]$/g, '') : '';
        this.ws = null;
        this.requestId = 0;
        this.callbacks = new Map();
        this.isConnected = false;
        this.balance = 0;
        console.log(`DerivAPI Initialized. Token length: ${this.apiToken.length}`);
        if (this.apiToken.length > 4) {
            console.log(`Token preview: ${this.apiToken.substring(0, 4)}...`);
        } else {
            console.log('Token is too short or empty.');
        }
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
                    resolve();
                    return;
                }

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
        try {
            const response = await this.send({
                authorize: this.apiToken
            });

            if (response.authorize) {
                console.log('Authorized:', response.authorize);
                // Subscribe to balance updates
                await this.subscribeToBalance();
                return response.authorize;
            }
        } catch (error) {
            console.error('Authorization failed details:', error);
            // If it's a validation error, it's likely the token format
            if (error.error && error.error.code === 'InputValidationFailed') {
                throw new Error('Invalid Token Format. Please check your .env file.');
            }
            throw new Error(error.message || 'Authorization failed');
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
    }

    // Always ensure we are connected
    if (!derivAPIInstance.isConnected) {
        await derivAPIInstance.connect();
    }
    return derivAPIInstance;
}

export function getDerivAPI() {
    return derivAPIInstance;
}

export async function getBalances() {
    try {
        let token = import.meta.env.VITE_DERIV_API_TOKEN;

        // Sanitize token: remove whitespace and potential quotes if user added them
        if (token) {
            token = String(token).trim().replace(/^['"]|['"]$/g, '');
        }

        // Check for explicit demo mode or missing token
        if (!token) {
            console.warn('⚠️ Deriv Service: VITE_DERIV_API_TOKEN is missing in .env');
            console.warn('🎮 DEMO MODE: Falling back to mock data due to missing configuration.');
            return {
                mpesa: 1000.0,
                deriv: 2500.50, // Demo balance
                isDemo: true,
                error: 'Configuration Missing: VITE_DERIV_API_TOKEN'
            };
        }

        if (token === 'demo') {
            console.log('🎮 Deriv Service: Demo mode requested via config.');
            return {
                mpesa: 1000.0,
                deriv: 2500.50, // Demo balance
                isDemo: true
            };
        }

        // Initialize and connect
        if (!derivAPIInstance || !derivAPIInstance.isConnected) {
            console.log('🔌 Deriv Service: Initializing connection with token...');
            await initializeDerivAPI(token);
        }

        // Double check connection status
        if (!derivAPIInstance.isConnected) {
            throw new Error('Failed to establish connection to Deriv API');
        }

        console.log('💰 Deriv Service: Fetching real balance...');
        const derivBalance = await derivAPIInstance.getBalance();
        console.log('✅ Deriv Service: Balance fetched:', derivBalance);

        return {
            mpesa: 1000.0, // Mock M-Pesa balance (until integrated)
            deriv: derivBalance,
            isDemo: false
        };
    } catch (error) {
        console.error('❌ Deriv Service Error:', error);

        // Return error state so UI can show it, instead of silently faking it
        return {
            mpesa: 1000.0,
            deriv: 0,
            isDemo: false, // It's not demo mode, it's broken mode
            error: error.message || 'Connection Failed'
        };
    }
}

export async function processTransaction({ type, amount }) {
    try {
        if (!derivAPIInstance || !derivAPIInstance.isConnected) {
            const token = import.meta.env.VITE_DERIV_API_TOKEN;
            if (!token) throw new Error('API Token not configured');
            // Constructor will sanitize it
            await initializeDerivAPI(token);
        }

        // Simulate network latency
        await new Promise(res => setTimeout(res, 800));

        // Get current balance
        const currentBalance = await derivAPIInstance.getBalance();

        // Validate transaction
        if (amount <= 0) {
            throw new Error('Amount must be positive');
        }

        if (type === 'deposit') {
            // In production: Call M-Pesa API to deduct amount
            // Then deposit to Deriv (Deriv API doesn't support direct deposits via API)
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

        // Re-fetch balance to ensure it's up to date (in case of real changes)
        // For simulation, we return the calculated new states since we can't actually change the Deriv balance via API easily for deposit
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
