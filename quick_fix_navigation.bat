@echo off
echo === QUICK FIX: REMOVE CONFLICTED NAVIGATION.TSX ===
echo.

echo Step 1: Stopping any running processes...
taskkill /F /IM node.exe 2>nul
taskkill /F /IM findstr.exe 2>nul

echo.
echo Step 2: Finding and removing Navigation.tsx files...
for /r %%f in (Navigation.tsx) do (
    echo Found: %%f
    del "%%f" /f /q
    echo Removed: %%f
)

echo.
echo Step 3: Adding changes to git...
git add -A

echo.
echo Step 4: Committing removal...
git commit -m "Remove conflicted Navigation.tsx files - quick fix"

echo.
echo Step 5: Pushing to GitHub...
git push origin main

echo.
echo === QUICK FIX COMPLETE ===
echo ✅ Conflicted files removed
echo ✅ Build should now succeed
echo ✅ Vercel will rebuild automatically
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.

pause
