import { sql, poolPromise } from './config/db.js';
import bcrypt from 'bcryptjs';

async function createTestUser() {
    try {
        const pool = await poolPromise;
        if (!pool) {
            console.error('❌ Database not connected');
            process.exit(1);
        }

        const email = 'test@test.com';
        const password = 'password';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const checkResult = await pool.request()
            .input('Email', sql.NVarChar, email)
            .query('SELECT * FROM Users WHERE Email = @Email');

        if (checkResult.recordset.length > 0) {
            console.log('✅ Test user already exists');
            console.log('Email:', email);
            console.log('Password:', password);
            process.exit(0);
        }

        // Create user
        await pool.request()
            .input('FirstName', sql.NVarChar, 'Test')
            .input('LastName', sql.NVarChar, 'User')
            .input('Name', sql.NVarChar, 'Test User')
            .input('Email', sql.NVarChar, email)
            .input('PasswordHash', sql.NVarChar, hashedPassword)
            .input('Phone', sql.NVarChar, '+254700000000')
            .query(`
                INSERT INTO Users (FirstName, LastName, Name, Email, PasswordHash, Phone) 
                VALUES (@FirstName, @LastName, @Name, @Email, @PasswordHash, @Phone)
            `);

        console.log('✅ Test user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);
        process.exit(0);
    } catch (err) {
        console.error('❌ Error:', err);
        process.exit(1);
    }
}

createTestUser();
