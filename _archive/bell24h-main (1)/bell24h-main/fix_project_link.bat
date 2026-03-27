@echo off
echo === FIXING PROJECT LINK TO BELL24H-V1 ===
echo.

echo Step 1: Unlinking wrong project (bell24h)...
npx vercel unlink

echo Step 2: Linking to CORRECT project (bell24h-v1)...
npx vercel link

echo Step 3: Deploying to bell24h-v1...
npx vercel --prod --force

echo.
echo === NOW DEPLOYING TO CORRECT PROJECT ===
echo.
echo Your DNS is configured in bell24h-v1, so this will work!
echo.
pause
