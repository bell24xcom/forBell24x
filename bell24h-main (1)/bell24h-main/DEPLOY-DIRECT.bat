@echo off
echo ========================================
echo   DIRECT DEPLOYMENT TO bell24h-v1
echo ========================================

echo Deploying directly to Vercel...
echo (Vercel will handle the build process)

npx vercel --prod --yes

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo   Check your site at: https://bell24h.com
echo ========================================
pause
