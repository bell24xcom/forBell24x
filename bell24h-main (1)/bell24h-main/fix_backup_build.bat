@echo off
echo === FIXING BACKUP DIRECTORY BUILD ISSUE ===
echo.

echo Step 1: Moving backup directory out of project...
if exist "BELL24H_BACKUP_2025-08-31T16-34-33-117Z" (
    move "BELL24H_BACKUP_2025-08-31T16-34-33-117Z" "..\BELL24H_BACKUP_2025-08-31T16-34-33-117Z"
    echo Backup directory moved successfully.
) else (
    echo Backup directory not found - skipping.
)

echo Step 2: Adding .vercelignore and .eslintrc.json...
git add .vercelignore .eslintrc.json

echo Step 3: Committing build fixes...
git commit -m "Fix Vercel build - exclude backup directories and handle ESLint warnings"

echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo === BUILD FIX DEPLOYED ===
echo.
echo Vercel will now exclude backup directories from the build.
echo Check Vercel dashboard for successful deployment.
echo Visit https://bell24h.com in 2-3 minutes.
echo.
pause
