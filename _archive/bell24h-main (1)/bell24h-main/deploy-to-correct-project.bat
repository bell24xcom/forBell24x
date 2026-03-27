@echo off
echo ========================================
echo   DEPLOY TO CORRECT PROJECT (bell24h-v1)
echo ========================================

echo.
echo Deploying to your main project: bell24h-v1
echo This is where your domain points to
echo.

echo Step 1: Syncing with GitHub...
git pull origin main
git add -A
git commit -m "Deploy React app to bell24h-v1"
git push origin main

echo.
echo Step 2: Deploying to bell24h-v1 project...
npx vercel --prod --project bell24h-v1

echo.
echo ✅ Deployment complete!
echo 🌐 Your site: https://bell24h-v1.vercel.app
echo.
pause
