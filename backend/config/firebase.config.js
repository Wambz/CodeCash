import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Check if Firebase credentials are configured
const hasFirebaseConfig = process.env.FIREBASE_PROJECT_ID &&
    (process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
        (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY));

let firebaseInitialized = false;

if (hasFirebaseConfig) {
    try {
        let firebaseConfig;

        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            // Option 1: Use service account JSON file
            const serviceAccount = await import(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, {
                assert: { type: 'json' }
            });

            firebaseConfig = {
                credential: admin.credential.cert(serviceAccount.default),
                projectId: process.env.FIREBASE_PROJECT_ID
            };
        } else {
            // Option 2: Use individual environment variables (Recommended for deployment)
            firebaseConfig = {
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                }),
                projectId: process.env.FIREBASE_PROJECT_ID
            };
        }

        // Initialize Firebase Admin
        admin.initializeApp(firebaseConfig);
        firebaseInitialized = true;
        console.log('✅ Firebase Admin SDK initialized successfully');
        console.log('🔧 Firestore configured with project:', process.env.FIREBASE_PROJECT_ID);
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
        console.warn('⚠️ Backend will run with limited functionality (authentication and database disabled)');
    }
} else {
    console.warn('⚠️ Firebase credentials not configured');
    console.warn('📝 Please set FIREBASE_PROJECT_ID and authentication credentials in .env file');
    console.warn('🔧 Backend will run with limited functionality');
    console.log('');
    console.log('To configure Firebase:');
    console.log('  1. Create a Firebase project at https://console.firebase.google.com');
    console.log('  2. Add environment variables to backend/.env:');
    console.log('     - FIREBASE_PROJECT_ID');
    console.log('     - FIREBASE_CLIENT_EMAIL');
    console.log('     - FIREBASE_PRIVATE_KEY');
    console.log('');
}

// Export Firebase services (will be null if not initialized)
export const auth = firebaseInitialized ? admin.auth() : null;
export const db = firebaseInitialized ? admin.firestore() : null;
export { admin };
export { firebaseInitialized };

// Firestore settings
if (db) {
    db.settings({
        ignoreUndefinedProperties: true,
        preferRest: true
    });
}
