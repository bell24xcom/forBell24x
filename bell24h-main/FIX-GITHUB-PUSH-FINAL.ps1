# ============================================
# FINAL FIX: Remove netlify-deploy from Git History
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL FIX: Remove Large Files from History" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "WARNING: This will rewrite git history!" -ForegroundColor Red
Write-Host "Only proceed if you're the only contributor." -ForegroundColor Yellow
Write-Host ""

# Step 1: Remove netlify-deploy locally
Write-Host "Step 1: Removing netlify-deploy locally..." -ForegroundColor Yellow
if (Test-Path netlify-deploy) {
    Remove-Item -Recurse -Force netlify-deploy -ErrorAction SilentlyContinue
    Write-Host "  netlify-deploy deleted locally" -ForegroundColor Green
} else {
    Write-Host "  netlify-deploy not found locally" -ForegroundColor Gray
}

# Step 2: Remove from current commit
Write-Host "Step 2: Removing from current commit..." -ForegroundColor Yellow
git rm -r --cached netlify-deploy 2>$null | Out-Null
git commit -m "Remove netlify-deploy directory" 2>$null | Out-Null
Write-Host "  Removed from current commit" -ForegroundColor Green

# Step 3: Remove from entire git history using filter-branch
Write-Host ""
Write-Host "Step 3: Removing from ENTIRE git history..." -ForegroundColor Yellow
Write-Host "  This may take 5-10 minutes. Please wait..." -ForegroundColor Gray
Write-Host ""

# Remove netlify-deploy from all commits
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch netlify-deploy" --prune-empty --tag-name-filter cat -- --all

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  netlify-deploy removed from history" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  filter-branch failed. Trying alternative..." -ForegroundColor Yellow
    
    # Alternative: Use git filter-repo if available
    if (Get-Command git-filter-repo -ErrorAction SilentlyContinue) {
        git filter-repo --path netlify-deploy --invert-paths --force
    } else {
        Write-Host "  git filter-repo not available. Manual cleanup required." -ForegroundColor Red
        Write-Host "  See: https://github.com/newren/git-filter-repo" -ForegroundColor Gray
    }
}

# Step 4: Remove toolhive-studio from history
Write-Host ""
Write-Host "Step 4: Removing toolhive-studio from history..." -ForegroundColor Yellow
git filter-branch --force --index-filter "git rm -rf --cached --ignore-unmatch toolhive-studio" --prune-empty --tag-name-filter cat -- --all 2>$null | Out-Null
Write-Host "  toolhive-studio removed from history" -ForegroundColor Green

# Step 5: Clean up filter-branch backups
Write-Host ""
Write-Host "Step 5: Cleaning up filter-branch backups..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .git/refs/original/ -ErrorAction SilentlyContinue
git reflog expire --expire=now --all 2>$null | Out-Null
git gc --prune=now --aggressive 2>$null | Out-Null
Write-Host "  Cleanup complete" -ForegroundColor Green

# Step 6: Verify no large files remain
Write-Host ""
Write-Host "Step 6: Verifying no large files remain..." -ForegroundColor Yellow
$largeFiles = git ls-files | ForEach-Object {
    $file = $_
    if (Test-Path $file) {
        $size = (Get-Item $file -ErrorAction SilentlyContinue).Length / 1MB
        if ($size -gt 50) {
            Write-Host "  WARNING: Large file found: $file ($([math]::Round($size, 2)) MB)" -ForegroundColor Yellow
            $file
        }
    }
}

if ($largeFiles) {
    Write-Host "  Large files still present. Removing..." -ForegroundColor Yellow
    $largeFiles | ForEach-Object {
        git rm --cached $_ 2>$null | Out-Null
    }
    git commit -m "Remove remaining large files" 2>$null | Out-Null
} else {
    Write-Host "  No large files found" -ForegroundColor Green
}

# Step 7: Force push to GitHub
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
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Go to Cloudflare Dashboard" -ForegroundColor Gray
    Write-Host "  2. Create Cloudflare Pages project" -ForegroundColor Gray
    Write-Host "  3. Connect your GitHub repo" -ForegroundColor Gray
    Write-Host "  4. Deploy!" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "Force push failed. Try manual push:" -ForegroundColor Yellow
    Write-Host "  git push origin main --force" -ForegroundColor Gray
    Write-Host ""
    Write-Host "If it still fails, you may need to:" -ForegroundColor Yellow
    Write-Host "  1. Use BFG Repo-Cleaner: https://rtyley.github.io/bfg-repo-cleaner/" -ForegroundColor Gray
    Write-Host "  2. Or create a new repository and push fresh code" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Done!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

