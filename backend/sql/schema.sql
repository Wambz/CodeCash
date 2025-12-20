IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(20),
    AvatarUrl NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

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
