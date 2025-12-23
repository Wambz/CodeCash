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

const connectWithRetry = async (retries = 5, delay = 5000) => {
    let pool = null;
    for (let i = 0; i < retries; i++) {
        try {
            pool = await new sql.ConnectionPool(config).connect();
            console.log('✅ Connected to SQL Server');
            return pool;
        } catch (err) {
            console.error(`⚠️ Database Connection Failed (Attempt ${i + 1}/${retries}):`, err.message);
            if (i < retries - 1) {
                console.log(`Waiting ${delay / 1000}s before retrying...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    console.error('❌ All connection attempts failed. Backend will run with limited functionality.');
    return null;
};

const poolPromise = connectWithRetry();

export { sql, poolPromise };
