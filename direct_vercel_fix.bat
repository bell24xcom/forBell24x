@echo off
echo === DIRECT VERCEL FIX ===
echo.

echo Step 1: Killing all node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Step 2: Adding all changes...
git add .

echo Step 3: Committing icon fixes...
git commit -m "Fix missing icon imports - ready for bell24h-v1 deployment"

echo Step 4: Pushing to GitHub...
git push origin main

echo Step 5: Manual Vercel deployment...
echo.
echo MANUAL STEPS REQUIRED:
echo 1. Go to https://vercel.com/dashboard
echo 2. Click on "bell24h-v1" project (NOT bell24h)
echo 3. Click "Deploy" or "Redeploy" button
echo 4. Wait for deployment to complete
echo 5. Visit https://bell24h.com
echo.
echo Your DNS is configured in bell24h-v1, so this will work!
echo.
pause
