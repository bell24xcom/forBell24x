@echo off
echo [SSL SETUP] Bell24H SSL Setup - Automated Deployment
echo.

set SSH_KEY=C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key
set VM_USER=ubuntu
set VM_IP=80.225.192.248

echo [CONNECTING] Connecting to VM and setting up SSL...
echo    Target: %VM_USER%@%VM_IP%
echo.

echo Executing SSL setup commands on VM...
echo.

ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no %VM_USER%@%VM_IP% "bash -s" < setup-ssl-automated.sh

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] SSL Setup Completed Successfully!
    echo.
    echo Your sites are now live with HTTPS:
    echo    - https://bell24h.com
    echo    - https://www.bell24h.com
    echo    - https://app.bell24h.com
    echo    - https://n8n.bell24h.com
    echo.
    echo [SUCCESS] All sites now have green lock SSL!
    echo.
    echo Wait 30 seconds, then test in your browser.
) else (
    echo.
    echo [ERROR] Setup failed with exit code: %ERRORLEVEL%
    exit /b 1
)

pause

