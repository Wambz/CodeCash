
import { sql, poolPromise } from './config/db.js';

async function verifyMissingDataUser() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.NVarChar, 'missing_data_user@example.com')
            .query('SELECT * FROM Users WHERE Email = @Email');

        if (result.recordset.length > 0) {
            console.log('✅ User found in DB:', result.recordset[0].Email);
            console.log('   ID:', result.recordset[0].Id);
            console.log('   Created At:', result.recordset[0].CreatedAt);
        } else {
            console.log('❌ User NOT found in DB');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verifyMissingDataUser();
