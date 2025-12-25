# Restart SQL Server Express
# Run this script as Administrator

Write-Host "Restarting SQL Server (SQLEXPRESS)..." -ForegroundColor Yellow
$serviceName = "SQL Server (SQLEXPRESS)"

try {
    Start-Service -DisplayName $serviceName -ErrorAction Stop
    Write-Host "SQL Server started successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error starting service: $_" -ForegroundColor Red
    Write-Host "Please run this script as Administrator." -ForegroundColor Yellow
}

# Wait a moment for the service to fully start
Start-Sleep -Seconds 2

# Check service status
$service = Get-Service -DisplayName $serviceName
Write-Host "Service Status: $($service.Status)" -ForegroundColor Cyan
