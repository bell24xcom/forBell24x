# ============================================
# Fix: Remove node_modules and toolhive-studio submodule
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Removing node_modules and submodules" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove toolhive-studio submodule
Write-Host "Step 1: Removing toolhive-studio submodule..." -ForegroundColor Yellow
if (Test-Path toolhive-studio) {
    git rm --cached toolhive-studio 2>$null | Out-Null
    Remove-Item -Recurse -Force toolhive-studio -ErrorAction SilentlyContinue
    Write-Host "  Removed toolhive-studio submodule" -ForegroundColor Green
} else {
    Write-Host "  toolhive-studio not found" -ForegroundColor Gray
}

# Step 2: Remove all node_modules from git tracking
Write-Host "Step 2: Removing node_modules from git..." -ForegroundColor Yellow
git rm -r --cached --ignore-unmatch **/node_modules/ 2>$null | Out-Null
git rm -r --cached --ignore-unmatch node_modules/ 2>$null | Out-Null
git rm -r --cached --ignore-unmatch server/node_modules/ 2>$null | Out-Null
git rm -r --cached --ignore-unmatch client/node_modules/ 2>$null | Out-Null
git rm -r --cached --ignore-unmatch .netlify/**/node_modules/ 2>$null | Out-Null
git rm -r --cached --ignore-unmatch netlify-deploy/node_modules/ 2>$null | Out-Null
Write-Host "  Removed node_modules from git tracking" -ForegroundColor Green

# Step 3: Remove large files
Write-Host "Step 3: Removing large files..." -ForegroundColor Yellow
git rm --cached --ignore-unmatch **/*.node 2>$null | Out-Null
git rm --cached --ignore-unmatch **/*.dat 2>$null | Out-Null
git rm --cached --ignore-unmatch prisma/*.db 2>$null | Out-Null
Write-Host "  Removed large files" -ForegroundColor Green

# Step 4: Remove .gitmodules if it references toolhive-studio
Write-Host "Step 4: Cleaning .gitmodules..." -ForegroundColor Yellow
if (Test-Path .gitmodules) {
    $content = Get-Content .gitmodules -Raw
    if ($content -match 'toolhive-studio') {
        Remove-Item .gitmodules -Force
        git rm --cached .gitmodules 2>$null | Out-Null
        Write-Host "  Removed .gitmodules" -ForegroundColor Green
    }
}

# Step 5: Deinitialize all submodules
Write-Host "Step 5: Deinitializing submodules..." -ForegroundColor Yellow
git submodule deinit --all -f 2>$null | Out-Null

# Step 6: Remove .git/modules
Write-Host "Step 6: Removing .git/modules..." -ForegroundColor Yellow
if (Test-Path .git\modules) {
    Remove-Item -Recurse -Force .git\modules -ErrorAction SilentlyContinue
    Write-Host "  Removed .git/modules" -ForegroundColor Green
}

# Step 7: Stage .gitignore
Write-Host "Step 7: Staging .gitignore..." -ForegroundColor Yellow
git add .gitignore
Write-Host "  .gitignore staged" -ForegroundColor Green

# Step 8: Stage all other changes
Write-Host "Step 8: Staging changes..." -ForegroundColor Yellow
git add -A
Write-Host "  Changes staged" -ForegroundColor Green

# Step 9: Commit
Write-Host "Step 9: Committing changes..." -ForegroundColor Yellow
git commit -m "Remove node_modules and toolhive-studio submodule - Fix GitHub push" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Changes committed" -ForegroundColor Green
} else {
    Write-Host "  No changes to commit" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Force Push Required" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your previous commit included node_modules which GitHub rejected." -ForegroundColor White
Write-Host "You need to force push to overwrite the bad commit." -ForegroundColor White
Write-Host ""
Write-Host "WARNING: This will rewrite git history." -ForegroundColor Yellow
Write-Host "Only do this if you're the only one working on this repo." -ForegroundColor Yellow
Write-Host ""

$force = Read-Host "Force push to GitHub? (y/n)"
if ($force -eq 'y' -or $force -eq 'Y') {
    Write-Host ""
    Write-Host "Force pushing to GitHub..." -ForegroundColor Yellow
    git push origin main --force
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS! Pushed to GitHub." -ForegroundColor Green
        Write-Host "Now go to Cloudflare Pages and retry deployment." -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Push failed. You may need to authenticate." -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "Skipping push. Run manually: git push origin main --force" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

