@echo off
echo === FIXING TRENDINGUP ICON IMPORT ===
echo.

echo Step 1: Fixing TrendingUp icon in admin dashboard...
powershell -Command "$file = Get-Content 'app\admin\dashboard\page.tsx' -Raw; $file = $file -replace 'TrendingUp', 'ArrowUpRight'; Set-Content 'app\admin\dashboard\page.tsx' $file"
echo ✓ Replaced TrendingUp with ArrowUpRight

echo.
echo Step 2: Adding changes to git...
git add app\admin\dashboard\page.tsx

echo.
echo Step 3: Committing fix...
git commit -m "Fix TrendingUp icon import - replaced with ArrowUpRight"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo === ICON FIX COMPLETE ===
echo ✅ TrendingUp icon replaced with ArrowUpRight
echo ✅ Build should now succeed
echo ✅ Vercel will rebuild automatically
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.

pause
