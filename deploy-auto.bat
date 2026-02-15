@echo off
REM ===========================================
REM BELL24H AUTO-DEPLOY SCRIPT (Windows)
REM Deploys local changes to production server
REM ===========================================

echo 🚀 BELL24H AUTO-DEPLOY STARTING...
echo ===================================

REM Configuration
set SERVER=165.232.187.195
set USER=root
set REMOTE_PATH=/root/bell24h-app
set LOCAL_COMPONENTS=C:\Project\Bell24h\components
set WINSCP_PATH="C:\Program Files (x86)\WinSCP\WinSCP.com"

echo Step 1: Checking local Git status...
cd /d C:\Project\Bell24h
git status --porcelain >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Git status checked
) else (
    echo ✗ Git status failed
    exit /b 1
)

echo Step 2: Committing local changes...
git add .
git commit -m "Auto-deploy: %date% %time%" --allow-empty >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Changes committed
) else (
    echo ⚠ No changes to commit or commit failed
)

echo Step 3: Pushing to GitHub...
git push origin main
if %errorlevel% equ 0 (
    echo ✓ Pushed to GitHub
) else (
    echo ✗ Push to GitHub failed
    exit /b 1
)

echo Step 4: Uploading files via WinSCP...
if exist %WINSCP_PATH% (
    echo open sftp://root:Bell@2026@%SERVER%/ > winscp_script.txt
    echo cd %REMOTE_PATH%/components/ >> winscp_script.txt
    echo lcd %LOCAL_COMPONENTS% >> winscp_script.txt
    echo put header-search-compact.tsx >> winscp_script.txt
    echo close >> winscp_script.txt
    echo exit >> winscp_script.txt

    %WINSCP_PATH% /script=winscp_script.txt
    del winscp_script.txt >nul 2>&1

    if %errorlevel% equ 0 (
        echo ✓ Files uploaded via WinSCP
    ) else (
        echo ✗ WinSCP upload failed
        exit /b 1
    )
) else (
    echo ⚠ WinSCP not found, manual upload required
    echo Please upload: %LOCAL_COMPONENTS%\header-search-compact.tsx
    echo To: %REMOTE_PATH%/components/
    pause
)

echo Step 5: SSH to server and rebuild...
echo cd %REMOTE_PATH% > ssh_commands.txt
echo echo "Pulling latest changes..." >> ssh_commands.txt
echo git pull origin main >> ssh_commands.txt
echo echo "Installing dependencies..." >> ssh_commands.txt
echo npm install >> ssh_commands.txt
echo echo "Rebuilding Docker container..." >> ssh_commands.txt
echo docker-compose down >> ssh_commands.txt
echo docker-compose up -d --build >> ssh_commands.txt
echo echo "Checking container status..." >> ssh_commands.txt
echo docker-compose ps >> ssh_commands.txt
echo echo "Deployment complete!" >> ssh_commands.txt

ssh -o StrictHostKeyChecking=no %USER%@%SERVER% < ssh_commands.txt
del ssh_commands.txt >nul 2>&1

if %errorlevel% equ 0 (
    echo ✓ Server deployment completed
) else (
    echo ✗ Server deployment failed
    exit /b 1
)

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo ================================
echo 🌐 Visit: https://www.bell24h.com/test-header
echo ⏱  Wait 30 seconds for changes to take effect
echo.

REM Test the deployment
echo Testing deployment...
timeout /t 10 /nobreak >nul
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://www.bell24h.com/test-header

echo 🚀 Deployment script completed successfully!
pause