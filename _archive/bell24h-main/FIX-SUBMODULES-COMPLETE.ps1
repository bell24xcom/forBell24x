# ============================================
# COMPLETE Submodule Removal for Cloudflare
# This removes ALL submodule references everywhere
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPLETE Submodule Removal" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Remove from git config
Write-Host "Step 1: Cleaning git config..." -ForegroundColor Yellow
$configPath = ".git\config"
if (Test-Path $configPath) {
    $configContent = Get-Content $configPath -Raw
    $lines = $configContent -split "`n"
    $newLines = @()
    $skipSubmodule = $false
    
    foreach ($line in $lines) {
        if ($line -match '^\s*\[submodule') {
            $skipSubmodule = $true
            continue
        }
        if ($skipSubmodule -and $line -match '^\s*\[') {
            $skipSubmodule = $false
        }
        if (-not $skipSubmodule) {
            $newLines += $line
        }
    }
    
    $newLines -join "`n" | Set-Content $configPath -NoNewline
    Write-Host "  Git config cleaned" -ForegroundColor Green
}

# Step 2: Remove .gitmodules
Write-Host "Step 2: Removing .gitmodules..." -ForegroundColor Yellow
if (Test-Path .gitmodules) {
    Remove-Item .gitmodules -Force
    git rm --cached .gitmodules 2>$null | Out-Null
    Write-Host "  .gitmodules removed" -ForegroundColor Green
} else {
    Write-Host "  No .gitmodules found" -ForegroundColor Gray
}

# Step 3: Remove .git/modules
Write-Host "Step 3: Removing .git/modules..." -ForegroundColor Yellow
if (Test-Path .git\modules) {
    Remove-Item -Recurse -Force .git\modules -ErrorAction SilentlyContinue
    Write-Host "  .git/modules removed" -ForegroundColor Green
} else {
    Write-Host "  No .git/modules found" -ForegroundColor Gray
}

# Step 4: Deinitialize all submodules
Write-Host "Step 4: Deinitializing submodules..." -ForegroundColor Yellow
git submodule deinit --all -f 2>$null | Out-Null
Write-Host "  Submodules deinitialized" -ForegroundColor Green

# Step 5: Remove from index
Write-Host "Step 5: Cleaning git index..." -ForegroundColor Yellow
git rm --cached -r .gitmodules 2>$null | Out-Null
git add .gitmodules 2>$null | Out-Null
Write-Host "  Git index cleaned" -ForegroundColor Green

# Step 6: Stage all changes
Write-Host "Step 6: Staging changes..." -ForegroundColor Yellow
git add -A
Write-Host "  Changes staged" -ForegroundColor Green

# Step 7: Commit
Write-Host "Step 7: Committing..." -ForegroundColor Yellow
git commit -m "COMPLETE: Remove all submodule references for Cloudflare" 2>$null
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
Write-Host "Now push to GitHub to update the remote:" -ForegroundColor White
Write-Host "  git push origin main --force" -ForegroundColor Gray
Write-Host ""
Write-Host "WARNING: --force will overwrite remote history." -ForegroundColor Yellow
Write-Host "This is safe if you're the only one working on this repo." -ForegroundColor Gray
Write-Host ""

$push = Read-Host "Push to GitHub now? (y/n)"
if ($push -eq 'y' -or $push -eq 'Y') {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main --force
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "SUCCESS! Pushed to GitHub." -ForegroundColor Green
        Write-Host "Cloudflare should now deploy without submodule errors." -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Push failed. Try manually: git push origin main --force" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT: Setup Cloudflare PAGES (not Workers)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: You're currently using Cloudflare WORKERS." -ForegroundColor Yellow
Write-Host "For Next.js, you need Cloudflare PAGES instead." -ForegroundColor Yellow
Write-Host ""
Write-Host "Steps:" -ForegroundColor White
Write-Host "1. Go to: https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host "2. Click: Workers & Pages (left sidebar)" -ForegroundColor Gray
Write-Host "3. Click: Create application > Pages > Connect to Git" -ForegroundColor Gray
Write-Host "4. Select: digitex-erp/bell24h" -ForegroundColor Gray
Write-Host "5. Framework: Next.js" -ForegroundColor Gray
Write-Host "6. Build command: npm run build" -ForegroundColor Gray
Write-Host "7. Output directory: .next" -ForegroundColor Gray
Write-Host "8. Click: Save and Deploy" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

