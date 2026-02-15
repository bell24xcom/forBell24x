@echo off
echo === FIXING ICON IMPORTS AND DEPLOYING ===
echo.

echo Step 1: Adding fixed icon imports...
git add app/components/components/

echo Step 2: Committing icon fixes...
git commit -m "Fix missing icon imports - deployment ready"

echo Step 3: Pushing to GitHub...
git push origin main

echo Step 4: Deploying to Vercel...
npx vercel --prod --force

echo.
echo === ICON FIXES DEPLOYED ===
echo.
echo Check https://vercel.com/dashboard for status
echo Visit https://bell24h.com in 2 minutes
echo.
pause
