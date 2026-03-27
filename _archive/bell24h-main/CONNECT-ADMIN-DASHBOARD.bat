@echo off
echo ========================================
echo   CONNECTING ADMIN DASHBOARD TO LIVE DATA
echo ========================================

echo Step 1: Adding admin API endpoints...
git add app/api/admin/

echo Step 2: Updating admin dashboard pages...
git add app/admin/

echo Step 3: Committing changes...
git commit -m "feat: connect admin dashboard to live data with analytics, users, and monitoring APIs"

echo Step 4: Pushing to GitHub...
git push origin main

echo Step 5: Deploying to Vercel...
npx vercel --prod --project bell24h-v1

echo ========================================
echo   ADMIN DASHBOARD CONNECTED TO LIVE DATA!
echo ========================================
echo.
echo Your admin dashboard now shows:
echo - Real-time user analytics
echo - Live user management
echo - System monitoring data
echo - RFQ management
echo - Lead tracking
echo.
echo Access at: https://bell24h.com/admin
echo ========================================
pause
