#IfWinActive ahk_exe Cursor.exe
F9::
Run, powershell.exe -NoExit -Command "cd 'C:\Users\Sanika\Projects\bell24h'; Write-Host 'Bell24h Project Terminal Ready!' -ForegroundColor Green; Write-Host 'Use Start-Bell24h or npm run dev to start the server' -ForegroundColor Yellow"
return

; Alternative: Ctrl+Alt+T to open external terminal
^!t::
Run, powershell.exe -NoExit -Command "cd 'C:\Users\Sanika\Projects\bell24h'; Write-Host 'Bell24h Project Terminal Ready!' -ForegroundColor Green; Write-Host 'Use Start-Bell24h or npm run dev to start the server' -ForegroundColor Yellow"
return

; Alternative: Ctrl+Alt+S to start clean dev server
^!s::
Run, powershell.exe -ExecutionPolicy Bypass -File "C:\Users\Sanika\Projects\bell24h\start_clean_dev.ps1"
return
#IfWinActive
