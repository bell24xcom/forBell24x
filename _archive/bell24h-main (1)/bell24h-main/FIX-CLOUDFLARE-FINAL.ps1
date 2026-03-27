# ============================================
# FINAL Cloudflare Fix - Complete Submodule Removal
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL Cloudflare Submodule Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if .gitmodules exists locally
Write-Host "Checking for submodule files..." -ForegroundColor Yellow
if (Test-Path .gitmodules) {
    Write-Host "  Found .gitmodules - removing..." -ForegroundColor Red
    Remove-Item .gitmodules -Force
    git rm --cached .gitmodules 2>$null | Out-Null
} else {
    Write-Host "  No .gitmodules found (good)" -ForegroundColor Green
}

# Remove .git/modules
if (Test-Path .git\modules) {
    Write-Host "  Found .git/modules - removing..." -ForegroundColor Red
    Remove-Item -Recurse -Force .git\modules -ErrorAction SilentlyContinue
} else {
    Write-Host "  No .git/modules found (good)" -ForegroundColor Green
}

# Deinitialize submodules
Write-Host "  Deinitializing submodules..." -ForegroundColor Yellow
git submodule deinit --all -f 2>$null | Out-Null

# Create a .gitattributes file to prevent submodule processing
Write-Host "  Creating .gitattributes to prevent submodule processing..." -ForegroundColor Yellow
if (-not (Test-Path .gitattributes)) {
    "# Prevent git from treating any directory as a submodule" | Out-File -FilePath .gitattributes -Encoding utf8
    git add .gitattributes
}

# Stage all changes
Write-Host ""
Write-Host "Staging changes..." -ForegroundColor Yellow
git add -A
$status = git status --short
if ($status) {
    Write-Host "  Changes found, committing..." -ForegroundColor Yellow
    git commit -m "FINAL: Remove all submodule references - Cloudflare Pages ready"
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
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "NEXT: Setup Cloudflare PAGES" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "IMPORTANT: You need Cloudflare PAGES (not Workers) for Next.js" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Steps:" -ForegroundColor White
    Write-Host "1. Go to: https://dash.cloudflare.com" -ForegroundColor Gray
    Write-Host "2. Workers & Pages > Create application" -ForegroundColor Gray
    Write-Host "3. Click: Pages tab (NOT Workers)" -ForegroundColor Gray
    Write-Host "4. Connect to Git > Select: digitex-erp/bell24h" -ForegroundColor Gray
    Write-Host "5. Framework: Next.js" -ForegroundColor Gray
    Write-Host "6. Build command: npm run build" -ForegroundColor Gray
    Write-Host "7. Output directory: .next" -ForegroundColor Gray
    Write-Host "8. Add environment variables (DATABASE_URL, etc.)" -ForegroundColor Gray
    Write-Host "9. Click: Save and Deploy" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After deployment:" -ForegroundColor White
    Write-Host "- Go to Settings > Builds & deployments" -ForegroundColor Gray
    Write-Host "- Click: Clear build cache" -ForegroundColor Gray
    Write-Host "- Go to Deployments tab" -ForegroundColor Gray
    Write-Host "- Click: Retry deployment" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Push failed. Check your GitHub authentication." -ForegroundColor Red
    Write-Host "You can push manually: git push origin main" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

