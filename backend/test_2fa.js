/**
 * Test 2FA Flow - End-to-End
 * Tests: Firebase Auth login → Send OTP → Verify OTP
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyBQdk1GWv2T_a0HMFWIKQf8xJmyN4z8gWs",
    authDomain: "codecash-fb0de.firebaseapp.com",
    projectId: "codecash-fb0de",
    storageBucket: "codecash-fb0de.firebasestorage.app",
    messagingSenderId: "297010848759",
    appId: "1:297010848759:web:552835a5fd9a0c033884f2"
};

const API_URL = 'http://localhost:5000';
const EMAIL = 'dwambz.54@gmail.com';
const PASSWORD = 'Derrick@54';

async function test2FA() {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║         2FA Flow End-to-End Test                  ║');
    console.log('╚═══════════════════════════════════════════════════╝');
    console.log('');

    try {
        // Step 1: Sign in with Firebase Client SDK
        console.log('🔹 Step 1: Authenticating with Firebase...');
        console.log(`   Email: ${EMAIL}`);
        
        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        
        const userCredential = await signInWithEmailAndPassword(auth, EMAIL, PASSWORD);
        const token = await userCredential.user.getIdToken();
        
        console.log('   ✅ Firebase auth successful');
        console.log(`   UID: ${userCredential.user.uid}`);
        console.log(`   Token: ${token.substring(0, 40)}...`);
        console.log('');

        // Step 2: Send OTP
        console.log('🔹 Step 2: Requesting OTP via /api/auth/send-otp...');
        
        const sendResponse = await fetch(`${API_URL}/api/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const sendData = await sendResponse.json();
        console.log(`   HTTP Status: ${sendResponse.status}`);
        console.log(`   Response:`, JSON.stringify(sendData, null, 4));
        
        if (sendData.success) {
            console.log('   ✅ OTP sent successfully');
            console.log(`   📧 Masked email: ${sendData.email}`);
            console.log(`   ⏰ Expires in: ${sendData.expiresIn}s`);
        } else {
            console.log('   ❌ Failed to send OTP:', sendData.message);
        }

        console.log('');

        // Step 3: Test verify-otp with a wrong code (should fail gracefully)
        console.log('🔹 Step 3: Testing OTP verification with WRONG code "000000"...');
        
        const verifyResponse = await fetch(`${API_URL}/api/auth/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ code: '000000' })
        });

        const verifyData = await verifyResponse.json();
        console.log(`   HTTP Status: ${verifyResponse.status}`);
        console.log(`   Response:`, JSON.stringify(verifyData, null, 4));
        
        if (!verifyData.success) {
            console.log('   ✅ Correctly rejected invalid OTP');
        } else {
            console.log('   ⚠️  Unexpected: dummy code was accepted');
        }

        console.log('');
        console.log('═══════════════════════════════════════════════════');
        console.log('');
        console.log('🏁 FINAL TEST RESULTS:');
        console.log('   1. Firebase Authentication:  ✅ PASSED');
        console.log(`   2. Send OTP to email:        ${sendData.success ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`   3. Wrong OTP rejected:       ${!verifyData.success ? '✅ PASSED' : '❌ FAILED'}`);
        console.log('');
        console.log('   📋 The OTP code is logged in the BACKEND server console.');
        console.log('   📧 If email is configured, it was also sent to the email.');
        console.log('');
        console.log('═══════════════════════════════════════════════════');

    } catch (error) {
        console.error('');
        console.error('❌ Test failed:', error.message);
        if (error.code) console.error('   Error code:', error.code);
        console.error('');
    }

    process.exit(0);
}

test2FA();
