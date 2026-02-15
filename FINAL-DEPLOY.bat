@echo off
echo ========================================
echo   FINAL DEPLOYMENT TO bell24h-v1
echo ========================================

echo Step 1: Installing dependencies...
npm install

echo.
echo Step 2: Building locally to verify...
npm run build

echo.
echo Step 3: Deploying to Vercel...
npx vercel --prod --yes

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo   Check your site at: https://bell24h.com
echo ========================================
pause
