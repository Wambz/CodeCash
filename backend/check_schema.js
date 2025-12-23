import { sql, poolPromise } from './config/db.js';

async function checkSchema() {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'Users' AND COLUMN_NAME = 'AvatarUrl'
            `);

        console.log('Schema Info:', result.recordset);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkSchema();
