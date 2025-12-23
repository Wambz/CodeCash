import dotenv from 'dotenv';
dotenv.config();

import { sql, poolPromise } from './config/db.js';

async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');
        const pool = await poolPromise;

        if (!pool) {
            console.log('❌ Connection pool is null');
            return;
        }

        console.log('✅ Connection successful!');

        // Test query
        const result = await pool.request().query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = \'BASE TABLE\'');
        console.log('\n📊 Tables in database:');
        result.recordset.forEach(row => {
            console.log(`  - ${row.TABLE_NAME}`);
        });

        process.exit(0);
    } catch (err) {
        console.error('❌ Connection test failed:', err.message);
        process.exit(1);
    }
}

testConnection();
