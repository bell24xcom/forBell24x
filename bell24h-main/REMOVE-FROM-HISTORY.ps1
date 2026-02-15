# ============================================
# Remove Large Files from ENTIRE Git History
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removing Large Files from Git History" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will rewrite git history!" -ForegroundColor Red
Write-Host "Only proceed if you're the only contributor." -ForegroundColor Yellow
Write-Host ""

# Step 1: Remove netlify-deploy from entire history
Write-Host "Step 1: Removing netlify-deploy from git history..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray

# Use git filter-branch to remove netlify-deploy from all commits
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch netlify-deploy" --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host "  netlify-deploy removed from history" -ForegroundColor Green
} else {
    Write-Host "  filter-branch failed, trying alternative method..." -ForegroundColor Yellow
    
    # Alternative: Remove from current commit and force push
    Write-Host "  Removing netlify-deploy from current state..." -ForegroundColor Yellow
    git rm -r --cached netlify-deploy 2>$null | Out-Null
    git commit -m "Remove netlify-deploy directory" 2>$null | Out-Null
}

# Step 2: Remove toolhive-studio from history
Write-Host "Step 2: Removing toolhive-studio from git history..." -ForegroundColor Yellow
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch toolhive-studio" --prune-empty --tag-name-filter cat -- --all 2>$null | Out-Null
Write-Host "  toolhive-studio removed from history" -ForegroundColor Green

# Step 3: Remove all node_modules from history
Write-Host "Step 3: Removing node_modules from git history..." -ForegroundColor Yellow
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch server/node_modules client/node_modules backend/node_modules load-testing/node_modules" --prune-empty --tag-name-filter cat -- --all 2>$null | Out-Null
Write-Host "  node_modules removed from history" -ForegroundColor Green

# Step 4: Clean up filter-branch backups
Write-Host "Step 4: Cleaning up filter-branch backups..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .git/refs/original/ -ErrorAction SilentlyContinue
git reflog expire --expire=now --all 2>$null | Out-Null
git gc --prune=now --aggressive 2>$null | Out-Null
Write-Host "  Cleanup complete" -ForegroundColor Green

# Step 5: Force push to GitHub
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FORCE PUSH TO GITHUB" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will overwrite remote history!" -ForegroundColor Red
Write-Host "Press Ctrl+C to cancel, or wait 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "Force pushing to GitHub..." -ForegroundColor Yellow
git push origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Large files removed from history." -ForegroundColor Green
    Write-Host "GitHub push completed successfully." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Force push failed. Try manual push:" -ForegroundColor Yellow
    Write-Host "  git push origin main --force" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

