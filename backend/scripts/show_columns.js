import { sql, poolPromise } from '../config/db.js';

async function showColumns() {
    try {
        const pool = await poolPromise;
        const result = await pool.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Users'");
        console.table(result.recordset);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
showColumns();
