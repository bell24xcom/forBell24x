@echo off
echo ========================================
echo   REMOVING CORRUPTED BACKUP FILES
echo ========================================

echo Removing client-backup directory...
if exist client-backup rmdir /s /q client-backup

echo Removing duplicate app/components/components...
if exist app\components\components rmdir /s /q app\components\components

echo Removing any other backup directories...
if exist BELL24H-WORKING-SITE-BACKUP-2024-12-19 rmdir /s /q BELL24H-WORKING-SITE-BACKUP-2024-12-19
if exist BELL24H-WORKING-SITE-BACKUP-2025-09-04 rmdir /s /q BELL24H-WORKING-SITE-BACKUP-2025-09-04
if exist backups rmdir /s /q backups
if exist client-backup rmdir /s /q client-backup
if exist client-new rmdir /s /q client-new

echo.
echo Committing cleanup...
git add -A
git commit -m "fix: remove corrupted backup files breaking build"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo   BACKUP FILES REMOVED!
echo   NOW READY FOR DEPLOYMENT
echo ========================================
pause
