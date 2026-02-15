@echo off
echo === COMPLETING DEPLOYMENT ===
echo.

echo Step 1: Unlinking Vercel project (manual command)...
npx vercel unlink

echo Step 2: Linking to correct project...
npx vercel link

echo Step 3: Deploying to production...
npx vercel --prod --force

echo.
echo === DEPLOYMENT COMPLETE ===
echo.
echo Check https://vercel.com/dashboard for status
echo Visit https://bell24h.com in 2 minutes
echo.
pause
