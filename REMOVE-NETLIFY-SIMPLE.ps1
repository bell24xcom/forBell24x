# ============================================
# Simple Fix: Remove netlify-deploy Completely
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removing netlify-deploy Directory" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove netlify-deploy locally if it exists
Write-Host "Step 1: Removing netlify-deploy locally..." -ForegroundColor Yellow
if (Test-Path netlify-deploy) {
    Remove-Item -Recurse -Force netlify-deploy -ErrorAction SilentlyContinue
    Write-Host "  netlify-deploy directory deleted locally" -ForegroundColor Green
} else {
    Write-Host "  netlify-deploy not found locally" -ForegroundColor Gray
}

# Step 2: Remove from git tracking
Write-Host "Step 2: Removing from git tracking..." -ForegroundColor Yellow
git rm -r --cached netlify-deploy 2>$null | Out-Null
Write-Host "  Removed from git tracking" -ForegroundColor Green

# Step 3: Update .gitignore to ensure it's ignored
Write-Host "Step 3: Updating .gitignore..." -ForegroundColor Yellow
if (-not (Select-String -Path .gitignore -Pattern "netlify-deploy" -Quiet)) {
    Add-Content -Path .gitignore -Value "`n# Netlify deploy folder`nnetlify-deploy/`n"
    Write-Host "  Added to .gitignore" -ForegroundColor Green
} else {
    Write-Host "  Already in .gitignore" -ForegroundColor Gray
}

# Step 4: Commit the removal
Write-Host "Step 4: Committing removal..." -ForegroundColor Yellow
git add .gitignore
git commit -m "Remove netlify-deploy directory (contains large files)"

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Committed" -ForegroundColor Green
} else {
    Write-Host "  No changes to commit" -ForegroundColor Gray
}

# Step 5: Check repository size
Write-Host ""
Write-Host "Step 5: Checking repository size..." -ForegroundColor Yellow
$repoSize = (Get-ChildItem -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "  Repository size: $([math]::Round($repoSize, 2)) MB" -ForegroundColor Cyan

# Step 6: Use BFG Repo-Cleaner or git filter-repo if available
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The netlify-deploy folder is still in git history." -ForegroundColor Yellow
Write-Host "To remove it completely, you have 2 options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "OPTION 1: Use git filter-branch (slower but built-in)" -ForegroundColor Cyan
Write-Host "  Run: .\REMOVE-FROM-HISTORY.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 2: Use BFG Repo-Cleaner (faster, requires Java)" -ForegroundColor Cyan
Write-Host "  1. Download: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Gray
Write-Host "  2. Run: java -jar bfg.jar --delete-folders netlify-deploy" -ForegroundColor Gray
Write-Host "  3. Run: git reflog expire --expire=now --all && git gc --prune=now --aggressive" -ForegroundColor Gray
Write-Host "  4. Run: git push origin main --force" -ForegroundColor Gray
Write-Host ""
Write-Host "OPTION 3: Create a new repository (if history doesn't matter)" -ForegroundColor Cyan
Write-Host "  1. Create new repo on GitHub" -ForegroundColor Gray
Write-Host "  2. Run: git remote set-url origin <new-repo-url>" -ForegroundColor Gray
Write-Host "  3. Run: git push origin main --force" -ForegroundColor Gray
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

