# ============================================
# Remove node_modules and large files from git
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removing node_modules and large files" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove node_modules from git tracking
Write-Host "Step 1: Removing node_modules from git..." -ForegroundColor Yellow
git rm -r --cached server/node_modules/ 2>$null | Out-Null
git rm -r --cached client/node_modules/ 2>$null | Out-Null
git rm -r --cached backend/node_modules/ 2>$null | Out-Null
git rm -r --cached netlify-deploy/node_modules/ 2>$null | Out-Null
git rm -r --cached load-testing/node_modules/ 2>$null | Out-Null
git rm -r --cached **/node_modules/ 2>$null | Out-Null
Write-Host "  node_modules removed from git" -ForegroundColor Green

# Step 2: Remove toolhive-studio submodule
Write-Host "Step 2: Removing toolhive-studio submodule..." -ForegroundColor Yellow
if (Test-Path toolhive-studio) {
    git rm --cached toolhive-studio 2>$null | Out-Null
    git submodule deinit -f toolhive-studio 2>$null | Out-Null
    Remove-Item -Recurse -Force toolhive-studio -ErrorAction SilentlyContinue
    Write-Host "  toolhive-studio submodule removed" -ForegroundColor Green
} else {
    Write-Host "  toolhive-studio not found" -ForegroundColor Gray
}

# Step 3: Remove large binary files
Write-Host "Step 3: Removing large binary files..." -ForegroundColor Yellow
git rm --cached netlify-deploy/node_modules/@next/swc-win32-x64-msvc/next-swc.win32-x64-msvc.node 2>$null | Out-Null
git rm --cached netlify-deploy/node_modules/geoip-lite/data/geoip-city.dat 2>$null | Out-Null
git rm --cached netlify-deploy/node_modules/geoip-lite/data/geoip-city6.dat 2>$null | Out-Null
Write-Host "  Large binary files removed" -ForegroundColor Green

# Step 4: Remove other large folders
Write-Host "Step 4: Removing other large folders..." -ForegroundColor Yellow
git rm -r --cached netlify-deploy/ 2>$null | Out-Null
git rm -r --cached toolhive-studio/ 2>$null | Out-Null
git rm -r --cached bell24h-mobile/ 2>$null | Out-Null
git rm -r --cached bell24h-production/ 2>$null | Out-Null
git rm -r --cached https-github.com-digitex-erp-bell24h/ 2>$null | Out-Null
Write-Host "  Large folders removed" -ForegroundColor Green

# Step 5: Remove Prisma database files
Write-Host "Step 5: Removing database files..." -ForegroundColor Yellow
git rm --cached prisma/dev.db 2>$null | Out-Null
git rm --cached prisma/*.db 2>$null | Out-Null
Write-Host "  Database files removed" -ForegroundColor Green

# Step 6: Add updated .gitignore
Write-Host "Step 6: Updating .gitignore..." -ForegroundColor Yellow
git add .gitignore
Write-Host "  .gitignore updated" -ForegroundColor Green

# Step 7: Stage all removals
Write-Host ""
Write-Host "Staging changes..." -ForegroundColor Yellow
git add -A

# Step 8: Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Remove node_modules, large files, and submodules from git tracking"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Changes committed" -ForegroundColor Green
} else {
    Write-Host "  No changes to commit" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PUSH TO GITHUB" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Pushed to GitHub." -ForegroundColor Green
    Write-Host "node_modules and large files are now ignored." -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Push failed. You may need to force push:" -ForegroundColor Yellow
    Write-Host "  git push origin main --force" -ForegroundColor Gray
    Write-Host ""
    Write-Host "WARNING: Force push will overwrite remote history." -ForegroundColor Red
    Write-Host "Only do this if you're the only one working on this repo." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

