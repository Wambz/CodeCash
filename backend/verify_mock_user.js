
import { sql, poolPromise } from './config/db.js';

async function verifyMock() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.NVarChar, 'test@example.com')
            .query('SELECT * FROM Users WHERE Email = @Email');

        if (result.recordset.length > 0) {
            console.log('✅ Mock User found in DB:', result.recordset[0].Email);
        } else {
            console.log('❌ Mock User NOT found in DB');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verifyMock();
