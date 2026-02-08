@echo off
echo ========================================================
echo   Manual Database Setup (Run as Administrator)
echo ========================================================

REM Set working directory to the script's location
cd /d "%~dp0"

echo.
echo Attempting to run setup_db.sql on Port 1434...
sqlcmd -S 127.0.0.1,1434 -E -C -i backend\sql\setup_db.sql
if %errorlevel% equ 0 goto schema

echo.
echo Port 1434 failed. Attempting Default Port (1433)...
sqlcmd -S 127.0.0.1 -E -C -i backend\sql\setup_db.sql

:schema
echo.
echo Attempting to run schema.sql...
sqlcmd -S 127.0.0.1,1434 -E -C -d CodeCashDB -i backend\sql\schema.sql
if %errorlevel% neq 0 (
    sqlcmd -S 127.0.0.1 -E -C -d CodeCashDB -i backend\sql\schema.sql
)

echo.
echo Done. If no errors above, Database is ready.
pause
