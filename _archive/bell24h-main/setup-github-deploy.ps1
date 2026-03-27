# Bell24H - GitHub Auto-Deploy Setup Script
# Run this in PowerShell from your project root

Write-Host "🚀 Bell24H GitHub Auto-Deploy Setup" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Initializing git repository..." -ForegroundColor Yellow
    git init
}

# Check if .env.production exists
if (Test-Path "client\.env.production") {
    Write-Host "✅ Found .env.production (will NOT be committed - secure)" -ForegroundColor Green
} else {
    Write-Host "⚠️  WARNING: .env.production not found!" -ForegroundColor Red
    Write-Host "   Make sure to create it before deploying." -ForegroundColor Yellow
}

# Check if Dockerfile exists
if (Test-Path "Dockerfile") {
    Write-Host "✅ Found Dockerfile" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: Dockerfile not found!" -ForegroundColor Red
    exit 1
}

# Check if build_spec.yaml exists
if (Test-Path "build_spec.yaml") {
    Write-Host "✅ Found build_spec.yaml" -ForegroundColor Green
} else {
    Write-Host "⚠️  build_spec.yaml not found (will be created)" -ForegroundColor Yellow
}

# Check if GitHub workflow exists
if (Test-Path ".github\workflows\deploy.yml") {
    Write-Host "✅ Found GitHub Actions workflow" -ForegroundColor Green
} else {
    Write-Host "⚠️  GitHub Actions workflow not found (will be created)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create GitHub repository: https://github.com/new" -ForegroundColor White
Write-Host "2. Add remote: git remote add origin https://github.com/YOUR_USERNAME/bell24h.git" -ForegroundColor White
Write-Host "3. Push code: git push -u origin main" -ForegroundColor White
Write-Host "4. Setup GitHub Secret (ORACLE_SSH_KEY) with your SSH private key" -ForegroundColor White
Write-Host "5. Every push will auto-deploy! 🎉" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: See GITHUB-ORACLE-AUTO-DEPLOY-GUIDE.md" -ForegroundColor Cyan

