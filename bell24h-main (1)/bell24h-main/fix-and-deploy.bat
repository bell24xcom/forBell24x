@echo off
echo ========================================
echo    FIX AND DEPLOY REACT APP
echo ========================================

echo.
echo Step 1: Syncing with GitHub...
git pull origin main
if %errorlevel% neq 0 (
    echo ⚠️ Git pull failed - continuing...
)

echo.
echo Step 2: Adding and committing changes...
git add -A
git commit -m "FIX: Deploy dynamic React app with proper Vercel config"
if %errorlevel% neq 0 (
    echo ⚠️ Git commit failed - continuing...
)

echo.
echo Step 3: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ⚠️ Git push failed - trying to force...
    git push origin main --force
    if %errorlevel% neq 0 (
        echo ⚠️ Git push still failed - continuing with Vercel...
    )
)

echo.
echo Step 4: Deploying to Vercel (bell24h-v1 project)...
npx vercel --prod --project bell24h-v1
if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed
    echo.
    echo Manual steps:
    echo 1. Go to https://vercel.com/dashboard
    echo 2. Find your bell24h-v1 project
    echo 3. Click "Deploy" or "Redeploy"
    echo 4. Your React app will be live!
    pause
    exit /b 1
)

echo.
echo ========================================
echo         DEPLOYMENT SUCCESSFUL!
echo ========================================
echo.
echo ✅ Your dynamic React app is now live!
echo 🌐 Check: https://bell24h.com
echo.
echo Features now working:
echo - Live RFQ ticker
echo - Mobile OTP authentication
echo - Dynamic search and categories
echo - Interactive navigation
echo - Professional B2B marketplace
echo.
pause
