# ============================================
# Fix GitHub Push Error - Remove Large Files
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing GitHub Push Error" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Reset the last commit (keep changes)
Write-Host "Step 1: Resetting last commit..." -ForegroundColor Yellow
git reset --soft HEAD~1
Write-Host "  Last commit reset (changes kept)" -ForegroundColor Green

# Step 2: Remove node_modules from staging
Write-Host "Step 2: Removing node_modules from git..." -ForegroundColor Yellow
git reset HEAD server/node_modules/ 2>$null | Out-Null
git reset HEAD client/node_modules/ 2>$null | Out-Null
git reset HEAD backend/node_modules/ 2>$null | Out-Null
git reset HEAD netlify-deploy/ 2>$null | Out-Null
git reset HEAD toolhive-studio/ 2>$null | Out-Null
git reset HEAD load-testing/node_modules/ 2>$null | Out-Null
Write-Host "  node_modules unstaged" -ForegroundColor Green

# Step 3: Remove from git tracking (but keep files locally)
Write-Host "Step 3: Removing from git tracking..." -ForegroundColor Yellow
git rm -r --cached server/node_modules/ 2>$null | Out-Null
git rm -r --cached client/node_modules/ 2>$null | Out-Null
git rm -r --cached backend/node_modules/ 2>$null | Out-Null
git rm -r --cached netlify-deploy/ 2>$null | Out-Null
git rm -r --cached toolhive-studio/ 2>$null | Out-Null
git rm -r --cached load-testing/node_modules/ 2>$null | Out-Null
git rm -r --cached bell24h-mobile/ 2>$null | Out-Null
git rm -r --cached bell24h-production/ 2>$null | Out-Null
git rm -r --cached https-github.com-digitex-erp-bell24h/ 2>$null | Out-Null
Write-Host "  Files removed from git tracking" -ForegroundColor Green

# Step 4: Remove toolhive-studio submodule if it exists
Write-Host "Step 4: Removing toolhive-studio submodule..." -ForegroundColor Yellow
if (Test-Path .gitmodules) {
    git rm --cached .gitmodules 2>$null | Out-Null
    Remove-Item .gitmodules -Force -ErrorAction SilentlyContinue
}
git submodule deinit -f toolhive-studio 2>$null | Out-Null
if (Test-Path .git/modules/toolhive-studio) {
    Remove-Item -Recurse -Force .git/modules/toolhive-studio -ErrorAction SilentlyContinue
}
Write-Host "  Submodule removed" -ForegroundColor Green

# Step 5: Add updated .gitignore
Write-Host "Step 5: Updating .gitignore..." -ForegroundColor Yellow
git add .gitignore
Write-Host "  .gitignore updated" -ForegroundColor Green

# Step 6: Add only the files we want (not node_modules)
Write-Host "Step 6: Staging clean files..." -ForegroundColor Yellow
git add FIX-CLOUDFLARE-FINAL.ps1 2>$null | Out-Null
git add FIX-CLOUDFLARE-AUTO.ps1 2>$null | Out-Null
git add REMOVE-LARGE-FILES.ps1 2>$null | Out-Null
git add CLOUDFLARE-PAGES-SETUP.md 2>$null | Out-Null
git add package.json 2>$null | Out-Null
git add wrangler.toml 2>$null | Out-Null
git add client/lib/web3.tsx 2>$null | Out-Null

# Remove src/lib/supabase.ts if it was deleted
if (Test-Path src/lib/supabase.ts) {
    git rm src/lib/supabase.ts 2>$null | Out-Null
} else {
    git add src/lib/supabase.ts 2>$null | Out-Null
}

Write-Host "  Clean files staged" -ForegroundColor Green

# Step 7: Check what will be committed
Write-Host ""
Write-Host "Checking what will be committed..." -ForegroundColor Yellow
$status = git status --short
$nodeModules = $status | Select-String -Pattern "node_modules"
if ($nodeModules) {
    Write-Host "  WARNING: node_modules still in staging!" -ForegroundColor Red
    Write-Host "  Removing all node_modules..." -ForegroundColor Yellow
    git reset HEAD **/node_modules/ 2>$null | Out-Null
    git rm -r --cached **/node_modules/ 2>$null | Out-Null
}

# Step 8: Commit clean changes
Write-Host ""
Write-Host "Step 7: Committing clean changes..." -ForegroundColor Yellow
git commit -m "Fix: Remove node_modules, large files, and submodules - Cloudflare Pages ready"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Clean commit created" -ForegroundColor Green
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
    Write-Host "Now setup Cloudflare Pages (see CLOUDFLARE-PAGES-SETUP.md)" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Push still failing. Checking for large files..." -ForegroundColor Yellow
    Write-Host "Run this to see what's being committed:" -ForegroundColor Gray
    Write-Host "  git ls-files | ForEach-Object { if ((Get-Item $_ -ErrorAction SilentlyContinue).Length -gt 50MB) { $_ } }" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

