@echo off
cd /d C:\Users\Sanika\Projects\bell24h
start "" powershell.exe -NoExit -ExecutionPolicy Bypass -Command "cd 'C:\Users\Sanika\Projects\bell24h'; Write-Host 'Bell24h Project Terminal Ready!' -ForegroundColor Green; Write-Host 'Use Start-Bell24h or npm run dev to start the server' -ForegroundColor Yellow"
