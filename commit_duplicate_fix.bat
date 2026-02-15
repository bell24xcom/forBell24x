@echo off
echo === COMMITTING DUPLICATE ARROWUP FIX ===
echo.

echo Step 1: Adding fixed file to git...
git add app\admin\dashboard\page.tsx

echo.
echo Step 2: Committing fix...
git commit -m "Remove duplicate ArrowUp import from admin dashboard"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo === DUPLICATE FIX COMMITTED ===
echo ✅ Duplicate ArrowUp import removed
echo ✅ Build should now succeed
echo ✅ Vercel will rebuild automatically
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.
pause
