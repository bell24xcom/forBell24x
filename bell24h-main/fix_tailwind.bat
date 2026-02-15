@echo off
echo Killing stuck processes...
taskkill /F /IM node.exe 2>nul
cd C:\Users\Sanika\Projects\bell24h
echo Installing Tailwind...
powershell -NoExit -Command "npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss --no-audit --no-fund"
pause
@echo off
setlocal
echo Killing stuck node processes...
taskkill /F /IM node.exe >nul 2>&1
cd /d C:\Users\Sanika\Projects\bell24h
echo Installing Tailwind/PostCSS dependencies in detached PowerShell...
start "Tailwind Install" powershell.exe -NoExit -ExecutionPolicy Bypass -Command "cd 'C:\Users\Sanika\Projects\bell24h'; npm install -D tailwindcss postcss autoprefixer @tailwindcss/postcss --no-audit --no-fund"
echo A new PowerShell window has been opened. Wait for it to finish before closing this window.
pause
endlocal
