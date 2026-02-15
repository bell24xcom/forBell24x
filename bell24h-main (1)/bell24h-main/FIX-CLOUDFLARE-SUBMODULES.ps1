# ============================================
# BELL24h - Cloudflare Submodule Fix Script
# Run this in PowerShell from: C:\Users\Sanika\Projects\bell24h
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BELL24h Cloudflare Submodule Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in the right directory
Write-Host "Step 1: Checking repository..." -ForegroundColor Yellow
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not a git repository! Make sure you're in C:\Users\Sanika\Projects\bell24h" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Git repository found" -ForegroundColor Green
Write-Host ""

# Step 2: Remove submodules
Write-Host "Step 2: Removing submodules..." -ForegroundColor Yellow
git submodule deinit --all -f 2>$null
Write-Host "✓ Submodules deinitialized" -ForegroundColor Green

# Step 3: Remove .gitmodules file
if (Test-Path .gitmodules) {
    git rm -f .gitmodules
    Write-Host "✓ Removed .gitmodules file" -ForegroundColor Green
} else {
    Write-Host "✓ No .gitmodules file found" -ForegroundColor Green
}

# Step 4: Remove .git/modules folder
if (Test-Path .git\modules) {
    Remove-Item -Recurse -Force .git\modules
    Write-Host "✓ Removed .git/modules folder" -ForegroundColor Green
} else {
    Write-Host "✓ No .git/modules folder found" -ForegroundColor Green
}
Write-Host ""

# Step 5: Check git status
Write-Host "Step 3: Checking for changes..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "Changes detected. Committing..." -ForegroundColor Yellow
    git add .
    git commit -m "Remove all submodule references for Cloudflare deployment"
    Write-Host "✓ Changes committed" -ForegroundColor Green
} else {
    Write-Host "✓ No changes to commit (repository is clean)" -ForegroundColor Green
}
Write-Host ""

# Step 6: Final instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Push to GitHub (if you have changes):" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Go to Cloudflare Dashboard:" -ForegroundColor White
Write-Host "   https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Clear Build Cache:" -ForegroundColor White
Write-Host "   - Go to Pages > Your Project > Settings" -ForegroundColor Gray
Write-Host "   - Click 'Clear build cache'" -ForegroundColor Gray
Write-Host "   - Confirm" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Retry Deployment:" -ForegroundColor White
Write-Host "   - Go to Deployments tab" -ForegroundColor Gray
Write-Host "   - Click 'Retry deployment' on the failed build" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done! Your repository is clean." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

