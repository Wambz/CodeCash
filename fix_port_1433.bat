@echo off
echo ========================================================
echo   Fixing Port 1433 Conflict (Please Run as Admin)
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
echo 1. Stopping Windows NAT Driver (clearing reserved ports)...
net stop winnat
if %errorLevel% neq 0 (
    echo [WARNING] Could not stop WinNAT. It might not be running. Proceeding...
)

echo.
echo 2. Starting SQL Server (to grab Port 1433)...
net start MSSQL$SQLEXPRESS
if %errorLevel% == 0 (
    echo [SUCCESS] SQL Server started successfully!
) else (
    echo [FAIL] SQL Server still failed to start.
)

echo.
echo 3. Restarting Windows NAT Driver...
net start winnat

echo.
echo Done.
pause
