# Bell24H Comprehensive System Setup Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Bell24H Comprehensive System Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js installation
Write-Host "Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host ""
Write-Host "Running comprehensive setup..." -ForegroundColor Yellow
node scripts/setup-comprehensive-system.js

Write-Host ""
Write-Host "Setup completed! Press Enter to exit..." -ForegroundColor Green
Read-Host
