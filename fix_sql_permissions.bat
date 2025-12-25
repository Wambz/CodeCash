@echo off
echo ========================================================
echo   Fixing SQL Server Permissions (Please Run as Admin)
echo ========================================================

REM Check for Admin rights
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [OK] Running with Administrator privileges.
) else (
    echo [ERROR] This script must be run as Administrator.
    echo Please right-click this file and select "Run as administrator".
    pause
    exit
)

echo.
echo 1. Stopping services (if any)...
net stop MSSQL$SQLEXPRESS 2>nul
net stop SQLBrowser 2>nul

echo.
echo 2. Taking ownership of SQL Data and Log folders...
takeown /f "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA" /R /A /D Y
takeown /f "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Log" /R /A /D Y

echo.
echo 3. Granting Full Control to Administrators...
icacls "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA" /T /C /grant "Administrators:(OI)(CI)F"
icacls "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Log" /T /C /grant "Administrators:(OI)(CI)F"

echo.
echo 4. Granting Full Control to Service Account...
icacls "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA" /T /C /grant "NT SERVICE\MSSQL$SQLEXPRESS:(OI)(CI)F"
icacls "C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\Log" /T /C /grant "NT SERVICE\MSSQL$SQLEXPRESS:(OI)(CI)F"

echo.
echo 5. Starting SQL Server Service...
net start MSSQL$SQLEXPRESS
if %errorLevel% == 0 (
    echo [SUCCESS] SQL Server started successfully!
) else (
    echo [FAIL] Could not start SQL Server. Please check the output above.
)

net start SQLBrowser

echo.
echo Done.
pause
