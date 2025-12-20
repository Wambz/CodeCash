// Mock service to simulate M-Pesa and Deriv interactions
// In a real app these would call your backend proxy which talks to the actual APIs.

let balances = {
    mpesa: 1000.0, // starting mock balance
    deriv: 500.0,
};

export async function getBalances() {
    // Simulate network latency
    await new Promise(res => setTimeout(res, 500));
    return { ...balances };
}

export async function processTransaction({ type, amount }) {
    await new Promise(res => setTimeout(res, 800));
    // Simple validation
    if (amount <= 0) {
        throw new Error('Amount must be positive');
    }
    if (type === 'deposit') {
        if (balances.mpesa < amount) {
            throw new Error('Insufficient M-Pesa balance');
        }
        balances.mpesa -= amount;
        balances.deriv += amount;
    } else if (type === 'withdraw') {
        if (balances.deriv < amount) {
            throw new Error('Insufficient Deriv balance');
        }
        balances.deriv -= amount;
        balances.mpesa += amount;
    } else {
        throw new Error('Invalid transaction type');
    }
    // Return updated balances
    return { balances: { ...balances } };
}
