# Two-Factor Authentication (2FA) in CodeCash

## Overview
To improve the security of user accounts, CodeCash implements an Email-based Two-Factor Authentication (2FA) verification step during the login process. The system combines Firebase Client Authentication with a custom OTP generator, powered by Firebase Admin SDK and Node.js.

## Workflow
1. **Initial Login**: Users provide their Email and Password in the client app.
2. **Backend OTP Trigger**: Upon successful password verification, an OTP code is generated, stored in a secure Firestore collection (`otp_codes`), and securely dispatched to the user's email.
3. **Verification Screen**: The frontend halts full application access and displays a 2FA prompt for the received 6-digit code.
4. **Validation**: The backend matches the provided code against the timestamped Firestore document. If successful, the user is granted full access.

## Pros & Cons

### Pros
- **Enhanced Security**: Protects users from unauthorized access even if their passwords are compromised.
- **Cost-Effective**: Email-based OTPs are generally cheaper to send across high volumes compared to SMS OTPs.
- **Easy Integration**: Using the Firebase Admin SDK combined with standard Node transport ensures rapid deployment without heavily modifying the core user database schema.

### Cons
- **Email Latency**: Depending on the email service configuration, verification codes might occasionally take seconds or even minutes to arrive.
- **User Friction**: Adds an extra required step during each new session login, which can hinder a completely seamless "click-and-go" user experience.
- **Offline Risk**: Cannot be completed if the user currently lacks access to their email inbox or an active internet connection to retrieve it.

## Technical Configuration
The backend server sets `--dns-result-order=ipv4first` and assigns `preferRest: true` inside the Firestore Admin API. These adjustments resolve severe IPv6 edge-case connection hangups (e.g., native `win/async.c` crashes or `ECONNRESET` timeouts) across disparate Windows networks when reading/writing OTP documents concurrently to Firestore.
