import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, 'backend/.env') });

console.log('Testing Admin SDK...');
console.log('Project ID:', process.env.FIREBASE_PROJECT_ID);
console.log('Client Email:', process.env.FIREBASE_CLIENT_EMAIL);

if (!process.env.FIREBASE_PRIVATE_KEY) {
    console.error('Missing FIREBASE_PRIVATE_KEY');
    process.exit(1);
}

try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
    });

    console.log('Admin initialized.');

    const email = `test_admin_${Date.now()}@example.com`;
    console.log(`Creating user ${email}...`);

    const userRecord = await admin.auth().createUser({
        email: email,
        password: 'password123',
        displayName: 'Admin Test User'
    });

    console.log('✅ Successfully created user:', userRecord.uid);
} catch (error) {
    console.error('❌ Admin SDK Error:', error);
}
