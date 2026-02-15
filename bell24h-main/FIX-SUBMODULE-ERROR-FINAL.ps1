# ============================================
# Fix Submodule Error - BELL24H-ULTIMATE-FIX-2025-09-30
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fixing Submodule Error" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove BELL24H-ULTIMATE-FIX-2025-09-30 locally if it exists
Write-Host "Step 1: Removing BELL24H-ULTIMATE-FIX-2025-09-30 locally..." -ForegroundColor Yellow
if (Test-Path BELL24H-ULTIMATE-FIX-2025-09-30) {
    Remove-Item -Recurse -Force BELL24H-ULTIMATE-FIX-2025-09-30 -ErrorAction SilentlyContinue
    Write-Host "  Directory deleted locally" -ForegroundColor Green
} else {
    Write-Host "  Directory not found locally" -ForegroundColor Gray
}

# Step 2: Remove from git tracking
Write-Host "Step 2: Removing from git tracking..." -ForegroundColor Yellow
git rm -r --cached BELL24H-ULTIMATE-FIX-2025-09-30 2>$null | Out-Null
Write-Host "  Removed from git tracking" -ForegroundColor Green

# Step 3: Remove .gitmodules if it exists
Write-Host "Step 3: Removing .gitmodules..." -ForegroundColor Yellow
if (Test-Path .gitmodules) {
    Remove-Item -Force .gitmodules -ErrorAction SilentlyContinue
    git rm --cached .gitmodules 2>$null | Out-Null
    Write-Host "  .gitmodules removed" -ForegroundColor Green
} else {
    Write-Host "  .gitmodules not found locally" -ForegroundColor Gray
}

# Step 4: Create .gitattributes to prevent submodule processing
Write-Host "Step 4: Creating .gitattributes..." -ForegroundColor Yellow
$gitattributes = @"
# Prevent Git from processing submodules
* submodule=unset
BELL24H-ULTIMATE-FIX-2025-09-30 submodule=unset
toolhive-studio submodule=unset
netlify-deploy submodule=unset
"@
Set-Content -Path .gitattributes -Value $gitattributes
git add .gitattributes
Write-Host "  .gitattributes created" -ForegroundColor Green

# Step 5: Remove from git history using filter-branch
Write-Host ""
Write-Host "Step 5: Removing from git history..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray

# Remove BELL24H-ULTIMATE-FIX-2025-09-30 from all commits
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch BELL24H-ULTIMATE-FIX-2025-09-30" --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Removed from history" -ForegroundColor Green
} else {
    Write-Host "  filter-branch failed, trying alternative..." -ForegroundColor Yellow
    git rm -r --cached BELL24H-ULTIMATE-FIX-2025-09-30 2>$null | Out-Null
    git commit -m "Remove BELL24H-ULTIMATE-FIX-2025-09-30 submodule" 2>$null | Out-Null
}

# Step 6: Clean up filter-branch backups
Write-Host "Step 6: Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .git/refs/original/ -ErrorAction SilentlyContinue
git reflog expire --expire=now --all 2>$null | Out-Null
git gc --prune=now --aggressive 2>$null | Out-Null
Write-Host "  Cleanup complete" -ForegroundColor Green

# Step 7: Commit changes
Write-Host ""
Write-Host "Step 7: Committing changes..." -ForegroundColor Yellow
git add .gitattributes
git commit -m "Fix: Remove BELL24H-ULTIMATE-FIX-2025-09-30 submodule reference - Cloudflare Pages ready"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Changes committed" -ForegroundColor Green
} else {
    Write-Host "  No changes to commit" -ForegroundColor Gray
}

# Step 8: Force push to GitHub
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FORCE PUSH TO GITHUB" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Force pushing to GitHub..." -ForegroundColor Yellow
git push origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "SUCCESS! Submodule removed from history." -ForegroundColor Green
    Write-Host "Now retry the Cloudflare Pages deployment." -ForegroundColor Cyan
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

