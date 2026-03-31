import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

// Fix for windows path resolution if needed, but let's try direct
dotenv.config({ path: './backend/.env' });

const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY
    ? `{
        "type": "service_account",
        "project_id": "${process.env.FIREBASE_PROJECT_ID}",
        "private_key_id": "123", 
        "private_key": "${process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')}",
        "client_email": "${process.env.FIREBASE_CLIENT_EMAIL}",
        "client_id": "123",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
        "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}"
      }`
    : '{}');

if (!serviceAccount.project_id) {
    console.error('Failed to load Firebase credentials from backend/.env');
    process.exit(1);
}

const app = initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function seed() {
    console.log('Seeding User 1 with Deriv Token...');
    try {
        await db.collection('users').doc('1').set({
            derivToken: 'CreateToken123', // Dummy token
            email: 'test@codecash.com'
        }, { merge: true });
        console.log('✅ User 1 updated with derivToken: CreateToken123');
    } catch (error) {
        console.error('❌ Error seeding:', error);
    }
}

seed();
