# 🚀 BRUTAL FIX SETUP - Bell24h External Automation

## ✅ IMMEDIATE ACTIONS (Do These Now)

### 1. Run the Clean Start Script
```powershell
# Right-click start_clean_dev.ps1 → Run with PowerShell
# OR open PowerShell and run:
.\start_clean_dev.ps1
```

### 2. Use External Terminal
```batch
# Double-click terminal_project.bat
# This opens a clean PowerShell window for all commands
```

### 3. Configure Cursor Terminal
1. Open Cursor → File → Preferences → Settings
2. Click `{}` icon to edit `settings.json`
3. Copy contents from `cursor_settings.json` into your settings
4. Restart Cursor

### 4. Optional: Auto-Start at Login
1. Open Task Scheduler (Win key → type "Task Scheduler")
2. Action → Import Task
3. Select `Bell24h_AutoStart_Task.xml`
4. Modify User ID if needed
5. OK

## 🎯 HOW TO USE

### Start Development Server
```powershell
# Method 1: Use the brutal script
.\start_clean_dev.ps1

# Method 2: Use your custom command
Start-Bell24h

# Method 3: Standard npm
npm run dev
```

### Open External Terminal
```batch
# Double-click this file
terminal_project.bat
```

### Stop Development Server
```powershell
# In the external PowerShell window
Ctrl+C

# Or force kill all node processes
Get-Process node | Stop-Process -Force
```

## 🔧 TROUBLESHOOTING

### If Dev Server Keeps Restarting
- Use `start_clean_dev.ps1` - it kills all node processes first
- Wait for "Ready" or "compiled" messages before refreshing browser

### If Tailwind Not Compiling
- Wait for compilation to complete in external PowerShell
- Check for "compiled successfully" message
- Then refresh browser

### If Cursor Terminal Still Has Issues
- Use `terminal_project.bat` for all commands
- Never use Cursor's integrated terminal for critical builds
- Use AutoHotkey script (`open_pwsh_on_cursor.ahk`) for quick access

## 📁 FILES CREATED

1. `start_clean_dev.ps1` - Brutal restart script
2. `terminal_project.bat` - External terminal launcher
3. `cursor_settings.json` - Cursor terminal configuration
4. `Bell24h_AutoStart_Task.xml` - Windows scheduled task
5. `open_pwsh_on_cursor.ahk` - AutoHotkey workaround

## 🎉 SUCCESS INDICATORS

- ✅ External PowerShell opens without "q" character bug
- ✅ Dev server starts and stays running
- ✅ Tailwind compiles successfully
- ✅ Browser shows enhanced homepage with Mobile OTP Login
- ✅ 3D background works (if enabled)

## 🚨 EMERGENCY COMMANDS

```powershell
# Kill everything and start fresh
Get-Process node | Stop-Process -Force
.\start_clean_dev.ps1

# Check what's running on ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Force free ports
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force
```

## 📞 NEXT STEPS

1. Test the setup with `.\start_clean_dev.ps1`
2. Verify enhanced homepage loads at http://localhost:3000
3. Test Mobile OTP Login modal
4. Configure Cursor settings
5. Set up auto-start if desired

**Remember**: Always use external PowerShell for critical operations. Cursor's terminal is now just for quick commands, not for running your dev server.
