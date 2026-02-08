import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID
};

console.log('Initializing Firebase with:', {
    apiKey: firebaseConfig.apiKey ? 'Set' : 'Missing',
    projectId: firebaseConfig.projectId
});

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testSignup() {
    try {
        console.log('Attempting to create user...');
        const email = `test_${Date.now()}@example.com`;
        const password = 'password123';

        await createUserWithEmailAndPassword(auth, email, password);
        console.log('✅ Success! User created.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating user:');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        process.exit(1);
    }
}

testSignup();
