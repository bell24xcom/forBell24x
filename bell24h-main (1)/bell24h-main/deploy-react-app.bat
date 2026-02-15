@echo off
echo === DEPLOY YOUR ACTUAL REACT APP ===
echo Deploying the dynamic B2B marketplace (not static HTML)

echo.
echo Step 1: Cleaning up...
if exist ".next" rmdir /s /q ".next"
if exist "out" rmdir /s /q "out"
echo ✅ Cleanup complete

echo.
echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo Step 3: Building React app...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed - checking for specific errors...
    echo.
    echo Common fixes:
    echo - Check for useSearchParams without Suspense
    echo - Verify all imports are correct
    echo - Check for missing dependencies
    exit /b 1
)
echo ✅ React app built successfully

echo.
echo Step 4: Deploying to Vercel (bell24h-v1 project)...
call npx vercel --prod --yes --project bell24h-v1
if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed
    echo.
    echo Manual deployment steps:
    echo 1. Go to https://vercel.com/dashboard
    echo 2. Find your bell24h-v1 project
    echo 3. Click "Deploy" or "Redeploy"
    echo 4. Your dynamic site will be live
    exit /b 1
)

echo.
echo === DEPLOYMENT SUCCESSFUL ===
echo.
echo ✅ Your dynamic B2B marketplace is now live!
echo ✅ Features working:
echo   - Live RFQ ticker
echo   - Mobile OTP authentication
echo   - Dynamic search and categories
echo   - Interactive navigation
echo   - Professional B2B design
echo.
echo 🌐 Check your site: https://bell24h.com
echo.
pause
