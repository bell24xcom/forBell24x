@echo off
echo === SWITCHING TO CORRECT PROJECT (bell24h-v1) ===
echo.

echo Step 1: Unlinking current project...
npx vercel unlink

echo Step 2: Linking to bell24h-v1 (where your DNS is configured)...
npx vercel link

echo Step 3: Deploying to bell24h-v1...
npx vercel --prod --force

echo.
echo === SWITCHED TO BELL24H-V1 PROJECT ===
echo.
echo Your DNS settings are in bell24h-v1, so this should work now!
echo Check https://vercel.com/dashboard for bell24h-v1 project
echo.
pause
