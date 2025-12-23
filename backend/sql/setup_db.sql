USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'CodeCashDB')
BEGIN
    CREATE DATABASE CodeCashDB;
    PRINT 'Database CodeCashDB created.';
END
ELSE
BEGIN
    PRINT 'Database CodeCashDB already exists.';
END
GO

USE CodeCashDB;
GO

-- Create Login (Server level)
IF NOT EXISTS (SELECT * FROM sys.server_principals WHERE name = 'codecash_user')
BEGIN
    CREATE LOGIN codecash_user WITH PASSWORD = 'CodeCash123!';
    PRINT 'Login codecash_user created.';
END
ELSE
BEGIN
    PRINT 'Login codecash_user already exists.';
END
GO

-- Create User (Database level)
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'codecash_user')
BEGIN
    CREATE USER codecash_user FOR LOGIN codecash_user;
    PRINT 'User codecash_user created in CodeCashDB.';
END
ELSE
BEGIN
    PRINT 'User codecash_user already exists in CodeCashDB.';
END
GO

-- Grant Permissions
ALTER ROLE db_owner ADD MEMBER codecash_user;
PRINT 'Granted db_owner to codecash_user.';
GO
