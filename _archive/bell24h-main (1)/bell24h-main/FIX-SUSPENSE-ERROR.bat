@echo off
echo ========================================
echo   FIXING SUSPENSE BOUNDARY ERROR
echo ========================================

echo Step 1: Fixing useSearchParams Suspense error...
git add app/rfq/compare-quotes/page.tsx

echo Step 2: Committing the fix...
git commit -m "fix: wrap useSearchParams in Suspense boundary for compare-quotes page"

echo Step 3: Pushing to GitHub...
git push origin main

echo Step 4: Deploying to Vercel...
npx vercel --prod

echo ========================================
echo   SUSPENSE ERROR FIXED AND DEPLOYED!
echo ========================================
echo.
echo The build should now succeed without errors.
echo.
pause
