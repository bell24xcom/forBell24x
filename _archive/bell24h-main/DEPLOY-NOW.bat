@echo off
echo ========================================
echo   DEPLOYING TO PRODUCTION
echo ========================================

echo Deploying to bell24h-v1...
npx vercel --prod --yes

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo   Check your site at: https://bell24h.com
echo ========================================
pause
