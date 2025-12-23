import { sql, poolPromise } from '../config/db.js';

async function setupResetTable() {
    try {
        const pool = await poolPromise;

        console.log('Creating PasswordResets table if needed...');

        await pool.query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PasswordResets')
            BEGIN
                CREATE TABLE PasswordResets (
                    Id INT IDENTITY(1,1) PRIMARY KEY,
                    Email NVARCHAR(255) NOT NULL,
                    Token NVARCHAR(10) NOT NULL,
                    ExpiresAt DATETIME NOT NULL,
                    CreatedAt DATETIME DEFAULT GETDATE()
                );
                PRINT 'PasswordResets table created.';
            END
            ELSE
            BEGIN
                PRINT 'PasswordResets table already exists.';
            END
        `);

        console.log('Setup complete.');
        process.exit(0);
    } catch (err) {
        console.error('Setup failed:', err);
        process.exit(1);
    }
}

setupResetTable();
