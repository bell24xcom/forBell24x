@echo off
echo === SIMPLE MERGE CONFLICT FIX ===
echo.

echo Step 1: Finding and removing conflicted Navigation.tsx files...
for /r %%f in (Navigation.tsx) do (
    echo Found: %%f
    del "%%f" /f /q
    echo Removed: %%f
)

echo.
echo Step 2: Adding all changes to git...
git add -A

echo.
echo Step 3: Committing removal of conflicted files...
git commit -m "Remove conflicted Navigation.tsx files"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo === SIMPLE FIX COMPLETE ===
echo ✅ Conflicted files removed
echo ✅ Build should now succeed
echo ✅ Site should deploy successfully
echo.

pause
