@echo off
echo === FINAL DEPLOYMENT SCRIPT ===
echo.

echo Step 1: Cleaning up...
taskkill /F /IM node.exe >nul 2>&1

echo Step 2: Adding all changes...
git add .

echo Step 3: Committing changes...
git commit -m "Emergency deployment fix - October 2nd launch"

echo Step 4: Pushing to GitHub...
git push origin main

echo Step 5: Deploying to Vercel...
npx vercel --prod --force

echo.
echo === DEPLOYMENT COMPLETE ===
echo.
echo Next steps:
echo 1. Check https://vercel.com/dashboard
echo 2. Wait 2 minutes
echo 3. Visit https://bell24h.com
echo.
echo If still 404, check the deployment logs in Vercel dashboard
echo.
pause
