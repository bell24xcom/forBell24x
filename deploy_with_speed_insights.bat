@echo off
echo === DEPLOYING WITH SPEED INSIGHTS ===
echo.

echo Step 1: Installing Speed Insights...
npm i @vercel/speed-insights

echo.
echo Step 2: Adding all changes to git...
git add -A

echo.
echo Step 3: Committing Speed Insights integration...
git commit -m "Add Vercel Speed Insights for performance monitoring"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo === DEPLOYMENT COMPLETE ===
echo Speed Insights will track performance metrics
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.

pause
