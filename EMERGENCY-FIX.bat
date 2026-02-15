@echo off
echo ========================================
echo   EMERGENCY FIX FOR DEPLOYMENT
echo ========================================

echo Step 1: Syncing with GitHub...
git fetch origin
git reset --hard origin/main

echo.
echo Step 2: Removing email-otp if it exists...
if exist app\api\auth\email-otp rmdir /s /q app\api\auth\email-otp

echo.
echo Step 3: Committing removal...
git add -A
git commit -m "fix: remove email-otp APIs causing merge conflicts" || echo "No changes to commit"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo Step 5: Building locally to test...
call npm run build

echo.
echo Step 6: If build succeeded, deploy...
if %errorlevel% equ 0 (
    echo Build successful! Deploying...
    npx vercel --prod --yes
) else (
    echo Build failed. Check the errors above.
)

echo.
echo ========================================
echo   DONE!
echo ========================================
pause
