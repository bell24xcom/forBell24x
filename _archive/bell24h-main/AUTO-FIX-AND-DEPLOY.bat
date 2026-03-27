@echo off
echo ========================================
echo   AUTOMATIC FIX AND DEPLOY TO bell24h-v1
echo ========================================

echo Step 1: Adding all changes...
git add -A

echo.
echo Step 2: Committing fixes...
git commit -m "fix: resolve merge markers and TSX syntax"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo Step 4: Removing old Vercel link...
if exist .vercel rmdir /s /q .vercel

echo.
echo Step 5: Linking to CORRECT Vercel project...
echo Linking directly to bell24h-v1...
npx vercel link --project bell24h-v1

echo.
echo Step 6: Deploying to production...
npx vercel --prod --yes

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo   Check your site at: https://bell24h.com
echo ========================================
pause
