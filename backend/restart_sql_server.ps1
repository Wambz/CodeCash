# Restart SQL Server Express
# Run this script as Administrator

Write-Host "Restarting SQL Server (SQLEXPRESS)..." -ForegroundColor Yellow
Restart-Service -Name "MSSQL`$SQLEXPRESS" -Force
Write-Host "SQL Server restarted successfully!" -ForegroundColor Green

# Wait a moment for the service to fully start
Start-Sleep -Seconds 2

# Check service status
$service = Get-Service -Name "MSSQL`$SQLEXPRESS"
Write-Host "Service Status: $($service.Status)" -ForegroundColor Cyan
