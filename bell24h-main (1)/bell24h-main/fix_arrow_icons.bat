@echo off
echo === FIXING ARROW ICONS ===
echo.

echo Step 1: Adding fixed file to git...
git add app\admin\dashboard\page.tsx

echo.
echo Step 2: Committing icon fix...
git commit -m "Fix ArrowUp/ArrowDown - replace with ChevronUp/ChevronDown"

echo.
echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo === ICON FIX COMMITTED ===
echo ✅ ArrowUp replaced with ChevronUp
echo ✅ ArrowDown replaced with ChevronDown
echo ✅ Build should now succeed
echo ✅ Vercel will rebuild automatically
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.
echo This should be the LAST icon error! 🎉
pause
