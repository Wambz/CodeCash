import { sql, poolPromise } from '../config/db.js';

async function migrateNames() {
    try {
        const pool = await poolPromise;

        console.log('Starting migration: Split Name into FirstName and LastName...');

        // 1. Add Columns if they don't exist
        await pool.query(`
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'FirstName')
            BEGIN
                ALTER TABLE Users ADD FirstName NVARCHAR(100);
                PRINT 'Added FirstName column.';
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'LastName')
            BEGIN
                ALTER TABLE Users ADD LastName NVARCHAR(100);
                PRINT 'Added LastName column.';
            END
        `);

        // 2. Migrate Data
        // Get all users with data in Name but NULL in FirstName
        const result = await pool.query("SELECT Id, Name FROM Users WHERE Name IS NOT NULL AND FirstName IS NULL");

        for (const user of result.recordset) {
            const fullName = user.Name.trim();
            const firstSpaceIndex = fullName.indexOf(' ');

            let firstName, lastName;

            if (firstSpaceIndex === -1) {
                firstName = fullName;
                lastName = ''; // Or handling single names differently? defaulting to empty string for now
            } else {
                firstName = fullName.substring(0, firstSpaceIndex);
                lastName = fullName.substring(firstSpaceIndex + 1);
            }

            await pool.request()
                .input('FirstName', sql.NVarChar, firstName)
                .input('LastName', sql.NVarChar, lastName)
                .input('Id', sql.Int, user.Id)
                .query("UPDATE Users SET FirstName = @FirstName, LastName = @LastName WHERE Id = @Id");

            console.log(`Migrated User ${user.Id}: '${fullName}' -> '${firstName}' '${lastName}'`);
        }

        console.log('Migration complete.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrateNames();
