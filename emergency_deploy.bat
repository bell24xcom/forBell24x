@echo off
echo === EMERGENCY DEPLOYMENT FIX ===
echo.

echo Step 1: Killing all node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Step 2: Unlinking broken Vercel project...
npx vercel unlink --yes

echo Step 3: Linking to correct project (bell24h, NOT bell24h-v1)...
npx vercel link --yes

echo Step 4: Deploying to production...
npx vercel --prod --force

echo.
echo === DEPLOYMENT COMPLETE ===
echo Check https://vercel.com/dashboard for status
echo Visit https://bell24h.com in 2 minutes
echo.
pause
