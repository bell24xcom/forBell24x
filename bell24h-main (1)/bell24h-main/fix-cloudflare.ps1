# Simple script to fix Cloudflare deployment
# Just run this file in PowerShell

Write-Host "Checking for submodule files..." -ForegroundColor Yellow

# Check if .gitmodules exists
if (Test-Path .gitmodules) {
    Write-Host "Found .gitmodules - deleting..." -ForegroundColor Red
    Remove-Item .gitmodules -Force
    git add .
    git commit -m "Remove .gitmodules for Cloudflare"
    Write-Host "Deleted .gitmodules - now push to GitHub manually" -ForegroundColor Green
} else {
    Write-Host "No .gitmodules file found - you're good!" -ForegroundColor Green
}

# Check for .git/modules folder
if (Test-Path .git\modules) {
    Write-Host "Found .git/modules - deleting..." -ForegroundColor Red
    Remove-Item -Recurse -Force .git\modules
    Write-Host "Deleted .git/modules folder" -ForegroundColor Green
} else {
    Write-Host "No .git/modules folder found - you're good!" -ForegroundColor Green
}

Write-Host "`nDone! Now:" -ForegroundColor Cyan
Write-Host "1. Go to Cloudflare Dashboard" -ForegroundColor White
Write-Host "2. Click 'Clear Build Cache'" -ForegroundColor White
Write-Host "3. Click 'Retry Deployment'" -ForegroundColor White
Write-Host "`nThat's it!" -ForegroundColor Green

