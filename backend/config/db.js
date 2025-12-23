import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

// Parse server and instance name
const serverParts = (process.env.DB_SERVER || 'localhost').split('\\');
const serverName = serverParts[0];
const instanceName = serverParts[1];

const config = {
    server: serverName,
    database: process.env.DB_NAME || 'CodeCashDB',
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true,
        instanceName: instanceName || undefined
    }
};

console.log('🔧 DB Config:', { server: config.server, instance: config.options.instanceName, database: config.database });

// Use Windows Authentication if no user is specified
if (process.env.DB_USER) {
    config.user = process.env.DB_USER;
    config.password = process.env.DB_PASSWORD;
} else {
    // Windows Authentication
    config.authentication = {
        type: 'ntlm',
        options: {
            domain: '',
            userName: '',
            password: ''
        }
    };
}

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
