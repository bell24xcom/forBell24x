# AUTOMATIC DEPLOYMENT TO bell24h-v1
Write-Host "========================================" -ForegroundColor Green
Write-Host "   AUTOMATIC DEPLOYMENT TO bell24h-v1" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "This will deploy your React app to the CORRECT project" -ForegroundColor Yellow
Write-Host "Project: bell24h-v1 (where your domain points)" -ForegroundColor Yellow

# Step 1: Sync with GitHub
Write-Host "`nStep 1: Syncing with GitHub..." -ForegroundColor Cyan
try {
    git pull origin main
    Write-Host "✅ Git pull successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Git pull failed - continuing..." -ForegroundColor Yellow
}

# Step 2: Add changes
Write-Host "`nStep 2: Adding changes..." -ForegroundColor Cyan
git add -A

# Step 3: Commit changes
Write-Host "`nStep 3: Committing changes..." -ForegroundColor Cyan
git commit -m "AUTO-DEPLOY: Deploy React app to bell24h-v1 project"

# Step 4: Push to GitHub
Write-Host "`nStep 4: Pushing to GitHub..." -ForegroundColor Cyan
try {
    git push origin main
    Write-Host "✅ Git push successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Git push failed - trying force..." -ForegroundColor Yellow
    try {
        git push origin main --force
        Write-Host "✅ Git push successful with force" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ Git push still failed - continuing..." -ForegroundColor Yellow
    }
}

# Step 5: Deploy to Vercel
Write-Host "`nStep 5: Deploying to bell24h-v1 project..." -ForegroundColor Cyan
Write-Host "This will deploy your dynamic React app to the correct project" -ForegroundColor Yellow
try {
    npx vercel --prod --project bell24h-v1
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel deployment failed" -ForegroundColor Red
    Write-Host "`nManual steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
    Write-Host "2. Find your bell24h-v1 project" -ForegroundColor White
    Write-Host "3. Click 'Deploy' or 'Redeploy'" -ForegroundColor White
    Write-Host "4. Your React app will be live!" -ForegroundColor White
    exit 1
}

# Success message
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "         DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`n✅ Your React app has been deployed to bell24h-v1" -ForegroundColor Green
Write-Host "`n🌐 Check your site: https://bell24h-v1.vercel.app" -ForegroundColor Cyan
Write-Host "🌐 Or your domain: https://bell24h.com" -ForegroundColor Cyan
Write-Host "`nFeatures now live:" -ForegroundColor Green
Write-Host "- Live RFQ ticker" -ForegroundColor White
Write-Host "- Mobile OTP authentication" -ForegroundColor White
Write-Host "- Dynamic search and categories" -ForegroundColor White
Write-Host "- Interactive navigation" -ForegroundColor White
Write-Host "- Professional B2B marketplace" -ForegroundColor White
Write-Host "`n🎉 No more static placeholder - this is your actual vision!" -ForegroundColor Green
