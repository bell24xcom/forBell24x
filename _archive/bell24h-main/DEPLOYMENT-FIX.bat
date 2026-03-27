@echo off
echo ========================================
echo   CRITICAL DEPLOYMENT FIX
echo ========================================

echo Step 1: Checking Vercel project configuration...
npx vercel projects ls

echo Step 2: Linking to correct project...
npx vercel link --project bell24h-v1

echo Step 3: Building application locally...
npm run build

echo Step 4: Deploying with correct configuration...
npx vercel --prod

echo Step 5: Verifying deployment...
echo Check your site at the URL provided above

echo ========================================
echo   DEPLOYMENT FIX COMPLETE!
echo ========================================
echo.
echo This should fix the Vercel authentication redirect issue
echo and show your actual Bell24h homepage instead.
echo.
pause
