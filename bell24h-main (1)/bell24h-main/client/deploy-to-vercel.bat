@echo off
echo ========================================
echo Bell24H Deployment to Vercel
echo ========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing Vercel CLI...
npm install -g vercel

echo.
echo Running deployment script...
node scripts/deploy-to-vercel.js

echo.
echo Deployment completed! Press any key to exit...
pause
