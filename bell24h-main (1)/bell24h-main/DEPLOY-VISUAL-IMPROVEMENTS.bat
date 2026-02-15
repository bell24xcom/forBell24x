@echo off
echo ========================================
echo   DEPLOYING VISUAL IMPROVEMENTS
echo ========================================

echo Step 1: Adding visual improvements...
git add -A

echo.
echo Step 2: Committing changes...
git commit -m "feat: add AI Features dropdown to match reference design"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo Step 4: Deploying to Vercel...
npx vercel --prod --yes

echo.
echo ========================================
echo   VISUAL IMPROVEMENTS DEPLOYED!
echo   Check: https://bell24h.com
echo ========================================
pause
