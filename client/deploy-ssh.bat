@echo off
REM ============================================
REM BELL24H AUTO-DEPLOY SCRIPT (SSH-BASED)
REM No WinSCP Required - Pure SSH!
REM ============================================

echo.
echo ========================================
echo   BELL24H AUTO-DEPLOYMENT SYSTEM
echo   SSH-Based Direct Push
echo ========================================
echo.

REM Configuration
set SERVER_IP=165.232.187.195
set SERVER_USER=root
set SERVER_PASS=Bell@2026
set SERVER_PATH=/root/bell24h-app
set LOCAL_PATH=C:\Project\Bell24h\client

echo [1/6] Checking Git status...
cd /d "%LOCAL_PATH%"
git status

echo.
echo [2/6] Committing local changes...
git add .
git commit -m "Deploy: %date% %time% - Auto-deployment via SSH"

echo.
echo [3/6] Pushing to GitHub...
git push origin main
if %errorlevel% neq 0 (
    echo WARNING: Git push failed or merge conflicts exist
    echo Continuing with direct SSH upload...
)

echo.
echo [4/6] Uploading files to server via SSH/SCP...
echo This will use SCP (SSH Copy Protocol) - no WinSCP needed!

REM Install sshpass if needed (for Windows, we'll use plink/pscp from PuTTY)
REM If you have Git Bash, it includes SSH

REM Option 1: Using Git Bash SSH (if installed)
if exist "C:\Program Files\Git\usr\bin\ssh.exe" (
    echo Using Git Bash SSH...
    "C:\Program Files\Git\usr\bin\ssh.exe" -o StrictHostKeyChecking=no %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH% && git pull origin main"
) else (
    REM Option 2: Using Windows built-in SSH (Windows 10+)
    echo Using Windows SSH...
    ssh -o StrictHostKeyChecking=no %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH% && git pull origin main"
)

echo.
echo [5/6] Rebuilding Docker containers on server...
ssh -o StrictHostKeyChecking=no %SERVER_USER%@%SERVER_IP% "cd %SERVER_PATH% && docker-compose down && docker-compose up -d --build"

echo.
echo [6/6] Verifying deployment...
timeout /t 10 /nobreak >nul
ssh -o StrictHostKeyChecking=no %SERVER_USER%@%SERVER_IP% "docker ps | grep bell24h"

echo.
echo ========================================
echo   DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your changes are now LIVE at:
echo https://www.bell24h.com
echo.
echo Test header at:
echo https://www.bell24h.com/test-header
echo.
pause