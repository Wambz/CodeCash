import sql from 'mssql';
import 'dotenv/config';

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: true, // Use this if you're on Azure.
        trustServerCertificate: true // Change to true for local dev / self-signed certs
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('✅ Connected to SQL Server');
        return pool;
    })
    .catch(err => {
        console.log('⚠️ Database Connection Failed! Backend will run with limited functionality.');
        console.log('Error: ', err.message);
        return null; // Don't throw, just return null pool
    });

export { sql, poolPromise };
