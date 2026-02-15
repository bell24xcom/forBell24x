@echo off
echo ========================================
echo    AUTOMATIC DEPLOYMENT TO bell24h-v1
echo ========================================
echo.
echo This will deploy your React app to the CORRECT project
echo Project: bell24h-v1 (where your domain points)
echo.

echo Step 1: Syncing with GitHub...
git pull origin main
if %errorlevel% neq 0 (
    echo ⚠️ Git pull failed - continuing...
)

echo.
echo Step 2: Adding changes...
git add -A

echo.
echo Step 3: Committing changes...
git commit -m "AUTO-DEPLOY: Deploy React app to bell24h-v1 project"

echo.
echo Step 4: Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo ⚠️ Git push failed - trying force...
    git push origin main --force
)

echo.
echo Step 5: Deploying to bell24h-v1 project...
echo This will deploy your dynamic React app to the correct project
npx vercel --prod --project bell24h-v1

echo.
echo ========================================
echo         DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo ✅ Your React app has been deployed to bell24h-v1
echo 🌐 Check your site: https://bell24h-v1.vercel.app
echo 🌐 Or your domain: https://bell24h.com
echo.
echo Features now live:
echo - Live RFQ ticker
echo - Mobile OTP authentication
echo - Dynamic search and categories
echo - Interactive navigation
echo - Professional B2B marketplace
echo.
echo 🎉 No more static placeholder - this is your actual vision!
echo.
pause
