# Test Build Script
Write-Host "Starting build test..."
Write-Host "Current directory: $(Get-Location)"
Write-Host "Node version: $(node --version)"
Write-Host "NPM version: $(npm --version)"

Write-Host "Checking package.json..."
if (Test-Path "package.json") {
    Write-Host "✅ package.json exists"
} else {
    Write-Host "❌ package.json not found"
}

Write-Host "Running npm run build..."
npm run build

Write-Host "Build test completed."
