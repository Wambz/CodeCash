# How to Get Missing Credentials from Your Dashboard

You are at: `https://developer.safaricom.co.ke/dashboard/apis?api=GettingStarted`

## 1. Get the MPESA_PASSKEY (For Deposits)

1. On that page, look at the **Left Sidebar** list of APIs.
2. Find and click **"M-Pesa Express"** (or *Lipa Na M-Pesa Online*).
3. On the right side, click the **"Simulate"** tab (or *Test* button).
4. In the "App" dropdown, select **"CODECASH"**.
5. Look for the **"Passkey"** field in the form.
6. **Copy that value** -> This is your `MPESA_PASSKEY`.

## 2. Get the MPESA_SECURITY_CREDENTIAL (For Withdrawals)

*This is located on a different page.*

1. Look at the top menu bar for **"Resources"** or **"Developer"**.
2. Click on **"Test Credentials"**.
   - Or go directly to: [https://developer.safaricom.co.ke/test_credentials](https://developer.safaricom.co.ke/test_credentials)
3. You will see a form for "Security Credential".
4. Enter your Initiator Password for **Derrick54**.
5. Click **"Generate"**.
6. **Copy the long nonsense string** -> This is your `MPESA_SECURITY_CREDENTIAL`.

---

## 3. Update Your Backend

Once you have both, update your `backend/.env` file:

```env
MPESA_PASSKEY=paste_passkey_here
MPESA_SECURITY_CREDENTIAL=paste_long_string_here
```

Then restart: `npm run dev:all`
