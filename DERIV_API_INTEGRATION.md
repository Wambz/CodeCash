# CODECASH - Deriv API Integration

## Overview
CODECASH now integrates with the real Deriv API to fetch live account balances and process transactions.

## API Integration Details

### Deriv API
- **Connection**: WebSocket (wss://ws.derivws.com/websockets/v3)
- **App ID**: 1089
- **Authentication**: Token-based authentication
- **Features Implemented**:
  - Real-time balance updates
  - WebSocket connection management
  - Automatic reconnection handling
  - Balance subscription for live updates

### API Token Storage
- Stored in `.env` file as `VITE_DERIV_API_TOKEN`
- Never committed to version control (added to `.gitignore`)
- Accessible via `import.meta.env.VITE_DERIV_API_TOKEN`

### Security Notes
> [!IMPORTANT]
> - API token is stored in environment variables
> - `.env` file is gitignored to prevent accidental commits
> - Token should be rotated regularly
> - Never expose API tokens in client-side code in production

> [!WARNING]
> - Current implementation stores token in frontend for demo purposes
> - **Production**: Move API calls to backend proxy server
> - Backend should handle all API authentication
> - Frontend should only communicate with your backend

## Implementation

### Files Created
1. **`src/api/derivService.js`** - Deriv API WebSocket service
2. **`.env`** - Environment variables (API token)
3. **`.gitignore`** - Prevents committing sensitive files

### Files Modified
1. **`src/pages/DashboardPage.jsx`** - Updated to use real Deriv API

### How It Works

#### 1. Connection Flow
```javascript
// Initialize connection
const api = new DerivAPI(apiToken);
await api.connect();
await api.authorize();
await api.subscribeToBalance();
```

#### 2. Balance Fetching
```javascript
// Get current balance
const balance = await api.getBalance();
// Balance updates automatically via WebSocket subscription
```

#### 3. Transaction Processing
- **Deposit**: M-Pesa → Deriv (simulated, needs M-Pesa API)
- **Withdraw**: Deriv → M-Pesa (simulated, needs M-Pesa API)

### Current Limitations
- M-Pesa integration not yet implemented (using mock values)
- Deriv API doesn't support direct deposits via API
- Transactions are simulated for demo purposes

## Next Steps for Production

### 1. Backend Proxy Server
Create a Node.js/Express backend to:
- Store API credentials securely
- Handle Deriv API communication
- Process M-Pesa transactions
- Validate and sanitize requests

### 2. M-Pesa API Integration
- Implement OAuth 2.0 authentication
- Add STK Push for deposits
- Add B2C for withdrawals
- Handle callbacks and confirmations

### 3. Real Transaction Flow
**Deposit Flow:**
1. User initiates deposit on frontend
2. Backend validates request
3. Backend calls M-Pesa STK Push
4. User confirms on phone
5. M-Pesa callback confirms payment
6. Backend credits Deriv account (manual or via payment processor)
7. Frontend updates balance

**Withdraw Flow:**
1. User initiates withdrawal
2. Backend validates Deriv balance
3. Backend processes withdrawal request
4. Backend initiates M-Pesa B2C transfer
5. M-Pesa confirms transfer
6. Frontend updates balance

### 4. Error Handling
- Network failure recovery
- WebSocket reconnection
- Transaction retry logic
- User-friendly error messages

### 5. Testing
- Test with Deriv demo account
- Test M-Pesa sandbox environment
- End-to-end transaction testing
- Error scenario testing

## Environment Variables

### Required
```env
VITE_DERIV_API_TOKEN=your_deriv_api_token_here
```

### Optional (for future M-Pesa integration)
```env
VITE_MPESA_CONSUMER_KEY=your_mpesa_consumer_key
VITE_MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
VITE_MPESA_SHORTCODE=your_mpesa_shortcode
```

## Usage

### Development
The app will automatically connect to Deriv API on dashboard load and fetch real balance.

### Production Deployment
1. Set environment variables on hosting platform
2. Implement backend proxy server
3. Update API calls to go through backend
4. Never expose API tokens in frontend code
