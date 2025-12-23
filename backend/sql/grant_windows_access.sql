USE CodeCashDB;
GO

-- Create Windows user for the current logged-in user
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'saika-01\home👌')
BEGIN
    CREATE USER [saika-01\home👌] FROM LOGIN [saika-01\home👌];
    PRINT 'User saika-01\home👌 created in CodeCashDB.';
END
ELSE
BEGIN
    PRINT 'User saika-01\home👌 already exists in CodeCashDB.';
END
GO

-- Grant db_owner role to the user
ALTER ROLE db_owner ADD MEMBER [saika-01\home👌];
PRINT 'Granted db_owner to saika-01\home👌.';
GO
