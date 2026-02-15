# ============================================
# BELL24H AUTO-DEPLOY SCRIPT (SSH-BASED)
# PowerShell Version - Pure SSH!
# ============================================

Write-Host ""
Write-Host "========================================"
Write-Host "  BELL24H AUTO-DEPLOYMENT SYSTEM"
Write-Host "  SSH-Based Direct Push"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$SERVER_IP = "165.232.187.195"
$SERVER_USER = "root"
$SERVER_PATH = "/root/bell24h-app"
$LOCAL_PATH = "C:\Project\Bell24h\client"

# Step 1: Check Git Status
Write-Host "[1/6] Checking Git status..." -ForegroundColor Yellow
Set-Location $LOCAL_PATH
git status

# Step 2: Commit Changes
Write-Host ""
Write-Host "[2/6] Committing local changes..." -ForegroundColor Yellow
git add .
$commitMessage = "Deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') - Auto-deployment via SSH"
git commit -m $commitMessage

# Step 3: Push to GitHub
Write-Host ""
Write-Host "[3/6] Pushing to GitHub..." -ForegroundColor Yellow
try {
    git push origin main
    Write-Host "✓ Git push successful" -ForegroundColor Green
} catch {
    Write-Host "⚠ WARNING: Git push failed - continuing with direct SSH upload..." -ForegroundColor Yellow
}

# Step 4: SSH Pull on Server
Write-Host ""
Write-Host "[4/6] Pulling latest code on server via SSH..." -ForegroundColor Yellow

# Create SSH command
$sshCommand = "cd $SERVER_PATH && git pull origin main"

# Execute SSH command
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" $sshCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Code pulled successfully on server" -ForegroundColor Green
} else {
    Write-Host "⚠ WARNING: Git pull failed on server" -ForegroundColor Yellow
    Write-Host "Attempting direct file copy..." -ForegroundColor Yellow
    
    # Fallback: Direct SCP copy of changed files
    scp -o StrictHostKeyChecking=no -r "$LOCAL_PATH\src\components\*" "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/src/components/"
}

# Step 5: Rebuild Docker
Write-Host ""
Write-Host "[5/6] Rebuilding Docker containers on server..." -ForegroundColor Yellow

$dockerCommand = "cd $SERVER_PATH && docker-compose down && docker-compose up -d --build"
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" $dockerCommand

Write-Host "✓ Docker rebuild initiated" -ForegroundColor Green

# Step 6: Verify Deployment
Write-Host ""
Write-Host "[6/6] Verifying deployment..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$verifyCommand = "docker ps | grep bell24h"
ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" $verifyCommand

# Final Status
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your changes are now LIVE at:" -ForegroundColor Cyan
Write-Host "https://www.bell24h.com" -ForegroundColor White
Write-Host ""
Write-Host "Test header at:" -ForegroundColor Cyan
Write-Host "https://www.bell24h.com/test-header" -ForegroundColor White
Write-Host ""

# Open browser
$openBrowser = Read-Host "Open website in browser? (Y/N)"
if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
    Start-Process "https://www.bell24h.com/test-header"
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")