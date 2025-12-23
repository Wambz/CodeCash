
import { sql, poolPromise } from './config/db.js';

async function verify() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.NVarChar, 'testuser_final@example.com')
            .query('SELECT * FROM Users WHERE Email = @Email');

        if (result.recordset.length > 0) {
            console.log('✅ User found in DB:', result.recordset[0].Email);
        } else {
            console.log('❌ User NOT found in DB');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verify();
