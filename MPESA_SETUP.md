# CODECASH M-Pesa Integration Setup Guide

## Quick Start

### 1. Configure M-Pesa Credentials

Edit `backend/.env` (create from `.env.example`):

```env
MPESA_CONSUMER_KEY=8GXGri468GXGlbzgcCcl1gNXjk1m2OuqBXluTqcrNkdHDImG
MPESA_CONSUMER_SECRET=IbkjKusLMwzRCaAtJIWlb88SmYQukGmDBODgFu7khQDqzKM2r0fIVtNaNDcJWjUl
MPESA_SHORTCODE=YOUR_SHORTCODE_HERE
MPESA_PASSKEY=YOUR_PASSKEY_HERE
MPESA_INITIATOR_NAME=YOUR_INITIATOR_NAME
MPESA_SECURITY_CREDENTIAL=YOUR_SECURITY_CREDENTIAL
MPESA_ENV=sandbox
```

### 2. Install Dependencies

```bash
npm install
cd backend && npm install && cd ..
```

### 3. Run Application

```bash
npm run dev:all
```

This starts both frontend (http://localhost:5173) and backend (http://localhost:5000).

## Missing Credentials

You need to obtain from [Safaricom Developer Portal](https://developer.safaricom.co.ke/):

- **Shortcode**: Your business paybill/till number
- **Passkey**: For STK Push authentication
- **Initiator Name**: For B2C transactions
- **Security Credential**: For B2C authentication

## Testing

1. Open http://localhost:5173
2. Sign in
3. Click "Deposit"
4. Enter phone: `0712345678`
5. Enter amount
6. Check phone for M-Pesa prompt
7. Enter PIN

## Callback URLs

For local testing with ngrok:
```bash
ngrok http 5000
# Update MPESA_CALLBACK_BASE_URL in backend/.env
```

## Troubleshooting

- **Authentication failed**: Check Consumer Key/Secret
- **Invalid shortcode**: Verify shortcode and passkey match
- **Callback not received**: Ensure callback URL is public

See `walkthrough.md` for detailed documentation.
