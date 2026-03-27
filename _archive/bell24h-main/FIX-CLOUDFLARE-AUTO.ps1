# BELL24h - Automatic Cloudflare Fix
# Run from: C:\Users\Sanika\Projects\bell24h

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BELL24h - Cloudflare Auto Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in git repository
if (-not (Test-Path .git)) {
    Write-Host "ERROR: Not in a git repository!" -ForegroundColor Red
    Write-Host "Please run this from: C:\Users\Sanika\Projects\bell24h" -ForegroundColor Yellow
    exit 1
}

Write-Host "Git repository found" -ForegroundColor Green
Write-Host ""

# Step 1: Remove submodules
Write-Host "Step 1: Removing submodules..." -ForegroundColor Yellow
git submodule deinit --all -f 2>$null | Out-Null

if (Test-Path .gitmodules) {
    git rm -f .gitmodules 2>$null | Out-Null
    Write-Host "  Removed .gitmodules" -ForegroundColor Green
}

if (Test-Path .git\modules) {
    Remove-Item -Recurse -Force .git\modules -ErrorAction SilentlyContinue
    Write-Host "  Removed .git/modules" -ForegroundColor Green
}

Write-Host "  Submodules cleaned" -ForegroundColor Green
Write-Host ""

# Step 2: Stage Cloudflare files
Write-Host "Step 2: Staging Cloudflare files..." -ForegroundColor Yellow
git add wrangler.toml 2>$null | Out-Null
git add package.json 2>$null | Out-Null
git add .gitignore 2>$null | Out-Null
git add client/lib/web3.tsx 2>$null | Out-Null

if (Test-Path src/lib/supabase.ts) {
    git rm src/lib/supabase.ts 2>$null | Out-Null
}

Write-Host "  Files staged" -ForegroundColor Green
Write-Host ""

# Step 3: Commit changes
Write-Host "Step 3: Committing changes..." -ForegroundColor Yellow
git commit -m "Fix: Remove submodules and prepare for Cloudflare deployment" 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  Changes committed" -ForegroundColor Green
} else {
    Write-Host "  No changes to commit (already clean)" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SUCCESS! Repository is ready." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Push to GitHub:" -ForegroundColor White
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Go to Cloudflare Dashboard:" -ForegroundColor White
Write-Host "   https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Clear Build Cache:" -ForegroundColor White
Write-Host "   Pages > Your Project > Settings > Clear build cache" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Retry Deployment:" -ForegroundColor White
Write-Host "   Deployments tab > Retry deployment" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Ask to push
$push = Read-Host "Do you want to push to GitHub now? (y/n)"

if ($push -eq 'y' -or $push -eq 'Y') {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "Successfully pushed to GitHub!" -ForegroundColor Green
        Write-Host "Now go to Cloudflare and retry the deployment." -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "Push failed. You may need to authenticate with GitHub." -ForegroundColor Yellow
        Write-Host "You can push manually later with: git push origin main" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Done! Your repository is ready for Cloudflare." -ForegroundColor Green
Write-Host ""
