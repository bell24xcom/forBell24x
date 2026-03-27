# Bell24H Deployment to Vercel Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Bell24H Deployment to Vercel" -ForegroundColor Cyan
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
Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel

Write-Host ""
Write-Host "Running deployment script..." -ForegroundColor Yellow
node scripts/deploy-to-vercel.js

Write-Host ""
Write-Host "Deployment completed! Press Enter to exit..." -ForegroundColor Green
Read-Host
