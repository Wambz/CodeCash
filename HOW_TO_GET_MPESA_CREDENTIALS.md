# How to Get Missing M-Pesa Credentials

## Still Needed:
1. **Passkey** - For STK Push (Lipa Na M-Pesa Online)
2. **Security Credential** - For B2C transfers

---

## Step 1: Get the Passkey

### For Sandbox (Testing)

1. **Go to Safaricom Developer Portal**
   - Visit: https://developer.safaricom.co.ke/
   - Log in to your account

2. **Navigate to Your App**
   - Click on "My Apps"
   - Select "CODECASH" (your application)

3. **Find Lipa Na M-Pesa Online**
   - Look for "APIs" section
   - Click on "Lipa Na M-Pesa Online"
   - Or go directly to: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate

4. **Get Sandbox Passkey**
   - In the "Test Credentials" or "Sandbox" section
   - You should see a "Passkey" field
   - Copy the entire passkey string
   - **Note**: Sandbox passkey is typically provided by Safaricom

5. **Common Sandbox Passkey**
   - For testing, Safaricom often provides a default sandbox passkey
   - Try this common sandbox passkey: `bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919`
   - This works with sandbox shortcode `174379`
   
   **Important**: If you're using shortcode `6801462`, you need the specific passkey for that shortcode.

### For Production

1. Log into your M-Pesa Business Portal
2. Go to "Lipa Na M-Pesa Online" settings
3. Find your production passkey
4. Copy the full passkey string

---

## Step 2: Get the Security Credential

The Security Credential is your initiator password encrypted with M-Pesa's public certificate.

### Option A: Use Safaricom Portal (Easiest)

1. **Go to Security Credentials Page**
   - Visit: https://developer.safaricom.co.ke/test_credentials
   - Or navigate to your app → "Test Credentials"

2. **Generate Security Credential**
   - Look for "Security Credential" section
   - You'll see an "Initiator Security Password" field
   - Enter your initiator password (the password for username `Derrick54`)
   - Click "Generate Security Credential"
   - Copy the generated encrypted string

### Option B: Generate Manually (Advanced)

If the portal doesn't work, you can generate it manually:

1. **Download M-Pesa Public Certificate**
   - Sandbox: https://developer.safaricom.co.ke/docs/SandboxCertificate.cer
   - Production: Get from your M-Pesa portal

2. **Encrypt Your Password**
   Use this Node.js script:

```javascript
const crypto = require('crypto');
const fs = require('fs');

// Your initiator password
const password = 'YOUR_INITIATOR_PASSWORD_HERE';

// Load the certificate
const cert = fs.readFileSync('SandboxCertificate.cer');

// Encrypt the password
const encrypted = crypto.publicEncrypt(
    {
        key: cert,
        padding: crypto.constants.RSA_PKCS1_PADDING
    },
    Buffer.from(password)
);

// Convert to base64
const securityCredential = encrypted.toString('base64');
console.log('Security Credential:', securityCredential);
```

3. **Run the script**:
```bash
node generate-credential.js
```

### Option C: Use Online Tool

1. Go to the Safaricom Developer Sandbox
2. Use their credential generator tool
3. Input your initiator password
4. Get the encrypted credential

---

## Step 3: Update Configuration

Once you have both credentials, update `backend/.env`:

```env
MPESA_PASSKEY=your_passkey_here
MPESA_SECURITY_CREDENTIAL=your_encrypted_credential_here
```

---

## Quick Sandbox Setup

If you want to start testing immediately with sandbox, try these common sandbox values:

### Common Sandbox Configuration:

```env
# Use Safaricom's test shortcode
MPESA_SHORTCODE=174379

# Common sandbox passkey
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Keep your initiator
MPESA_INITIATOR_NAME=Derrick54

# Generate using Option A above
MPESA_SECURITY_CREDENTIAL=GENERATED_CREDENTIAL_HERE
```

**Note**: If using the test shortcode `174379`, you also need to use test phone numbers like `254708374149`.

---

## Verification

After adding credentials, test with:

```bash
# Start backend
cd backend
node server.js

# Test auth endpoint
curl http://localhost:5000/health
```

Check logs for "M-Pesa access token obtained successfully"

---

## Troubleshooting

### "Invalid Shortcode/Passkey combination"
- Passkey must match your specific shortcode
- Contact Safaricom support for your shortcode's passkey

### "Security Credential Error"
- Ensure you encrypted with the correct certificate
- Verify initiator password is correct
- Try regenerating via portal

### "Cannot Generate Credential"
- Your account may need activation
- Contact Safaricom: apisupport@safaricom.co.ke

---

## Need Help?

**Safaricom Support:**
- Email: apisupport@safaricom.co.ke
- Phone: +254 711 051 000
- Portal: https://developer.safaricom.co.ke/support

**Documentation:**
- STK Push: https://developer.safaricom.co.ke/APIs/MpesaExpressSimulate
- B2C: https://developer.safaricom.co.ke/APIs/BusinessToCustomer
- Security: https://developer.safaricom.co.ke/docs/authentication

---

## Alternative: Start with Just STK Push

You can start testing deposits without B2C by:

1. Get only the **Passkey**
2. Comment out B2C code in `backend/routes/mpesa.js`
3. Test deposit flows first
4. Add B2C (withdrawals) later when you get Security Credential

This allows you to start testing immediately!
