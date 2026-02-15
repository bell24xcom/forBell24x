@echo off
echo === REMOVING BACKUP DIRECTORY TO FIX BUILD ===
echo.

echo Step 1: Removing backup directory...
if exist "BELL24H_BACKUP_2025-08-31T16-34-33-117Z" (
    rmdir /s /q "BELL24H_BACKUP_2025-08-31T16-34-33-117Z"
    echo ✓ Backup directory removed
) else (
    echo ✓ Backup directory already removed
)

echo.
echo Step 2: Adding all changes to git...
git add -A

echo.
echo Step 3: Committing backup removal...
git commit -m "Remove backup directory causing build errors"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo === BACKUP REMOVAL COMPLETE ===
echo Vercel will now build without the backup directory
echo Check: https://vercel.com/dashboard
echo.

pause
