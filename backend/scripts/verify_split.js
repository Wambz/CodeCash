import { sql, poolPromise } from '../config/db.js';
// import fetch from 'node-fetch'; // Built-in in Node 18+

async function verifySplit() {
    try {
        const pool = await poolPromise;
        const apiBase = 'http://localhost:5000/api/auth';

        const testUser = {
            firstName: 'Verif',
            lastName: 'User',
            email: `verif${Date.now()}@test.com`,
            password: 'password123',
            phone: '1234567890'
        };

        console.log('1. Testing Registration with Split Names...');
        const regRes = await fetch(`${apiBase}/register`, {
            method: 'POST',
            body: JSON.stringify(testUser),
            headers: { 'Content-Type': 'application/json' }
        });
        const regData = await regRes.json();
        console.log('Registration Response:', regData);

        if (!regData.success) throw new Error('Registration failed');

        console.log('2. Verifying DB Entry...');
        const result = await pool.request()
            .input('Email', sql.NVarChar, testUser.email)
            .query('SELECT FirstName, LastName, Name FROM Users WHERE Email = @Email');

        const user = result.recordset[0];
        console.table(user);

        if (user.FirstName !== testUser.firstName || user.LastName !== testUser.lastName) {
            throw new Error('DB verification failed: Names do not match.');
        }

        console.log('✅ Verification Successful: User created and DB columns populated correctly.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Verification Failed:', err);
        process.exit(1);
    }
}

verifySplit();
