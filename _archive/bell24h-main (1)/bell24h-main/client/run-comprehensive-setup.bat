@echo off
echo ========================================
echo Bell24H Comprehensive System Setup
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
echo Installing dependencies...
npm install

echo.
echo Running comprehensive setup...
node scripts/setup-comprehensive-system.js

echo.
echo Setup completed! Press any key to exit...
pause
