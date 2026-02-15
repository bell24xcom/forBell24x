@echo off
echo === MANUAL FIX: DUPLICATE ARROWUP ===
echo.

echo Step 1: Opening file in Notepad for manual edit...
echo Please:
echo 1. Find line 10 with "ArrowUp,"
echo 2. Delete that entire line
echo 3. Save (Ctrl+S) and close Notepad
echo.
notepad app\admin\dashboard\page.tsx

echo.
echo Step 2: Committing manual fix...
git add app\admin\dashboard\page.tsx
git commit -m "Manually remove duplicate ArrowUp line 10"
git push origin main

echo.
echo Step 3: Checking Vercel deployment...
echo Wait 3-5 minutes, then check: https://vercel.com/dashboard
echo Look for deployment with message "Manually remove duplicate ArrowUp line 10"
echo.

pause
