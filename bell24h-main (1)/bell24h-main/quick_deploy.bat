@echo off
echo === QUICK DEPLOYMENT FIX ===
echo.

echo Step 1: Committing all changes...
git add -A
git commit -m "Fix build errors - add missing icon imports"

echo.
echo Step 2: Pushing to GitHub...
git push origin main

echo.
echo Step 3: Deploy will trigger automatically on Vercel
echo Check: https://vercel.com/dashboard

pause
