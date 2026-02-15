@echo off
taskkill /F /IM node.exe 2>nul
cd C:\Users\Sanika\Projects\bell24h
start powershell -NoExit -Command "npm run dev"
@echo off
setlocal
echo Stopping any running node processes on ports 3000/3001...
taskkill /F /IM node.exe >nul 2>&1
cd /d C:\Users\Sanika\Projects\bell24h
echo Launching development server in new PowerShell window...
start "Bell24h Dev Server" powershell.exe -NoExit -ExecutionPolicy Bypass -Command "cd 'C:\Users\Sanika\Projects\bell24h'; npm run dev"
echo A new PowerShell window has been opened for the dev server. Leave it running.
pause
endlocal
