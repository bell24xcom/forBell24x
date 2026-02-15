@echo off
echo === FIXING DUPLICATE IMPORTS ===
echo.

echo Step 1: Fixing duplicate ArrowUp imports in admin dashboard...
powershell -Command "$file = Get-Content 'app\admin\dashboard\page.tsx' -Raw; $file = $file -replace 'ArrowUp,\s*ArrowUp,', 'ArrowUp,'; $file = $file -replace 'ArrowUp,\s*ArrowUp', 'ArrowUp'; Set-Content 'app\admin\dashboard\page.tsx' $file"
echo ✓ Removed duplicate ArrowUp imports

echo.
echo Step 2: Adding changes to git...
git add app\admin\dashboard\page.tsx

echo.
echo Step 3: Committing fix...
git commit -m "Fix duplicate ArrowUp imports in admin dashboard"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo === DUPLICATE IMPORTS FIXED ===
echo ✅ Duplicate imports removed
echo ✅ Build should now succeed
echo ✅ Vercel will rebuild automatically
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.

pause
