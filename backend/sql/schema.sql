IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Name NVARCHAR(100), -- Kept for backward compatibility
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20),
    AvatarUrl NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Attempt to alter table if it exists and columns are missing (Idempotent approach for manual run)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'FirstName')
    BEGIN
        ALTER TABLE Users ADD FirstName NVARCHAR(50);
    END
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[Users]') AND name = 'LastName')
    BEGIN
        ALTER TABLE Users ADD LastName NVARCHAR(50);
    END
END

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Transactions')
CREATE TABLE Transactions (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT FOREIGN KEY REFERENCES Users(Id),
    Type NVARCHAR(20) NOT NULL, -- 'deposit', 'withdraw'
    Amount DECIMAL(18, 2) NOT NULL,
    Status NVARCHAR(20), -- 'success', 'pending', 'failed'
    ReferenceId NVARCHAR(50),
    Timestamp DATETIME DEFAULT GETDATE()
);
