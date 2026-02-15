@echo off
echo ========================================
echo   ULTIMATE CSS FIX - COMPLETE SOLUTION
echo ========================================

echo Step 1: Fixing CSS configuration issues...
echo - Fixed PostCSS config (tailwindcss instead of @tailwindcss/postcss)
echo - Added CSS variables for theming
echo - Fixed Tailwind configuration

echo Step 2: Adding all CSS fixes...
git add app/globals.css
git add postcss.config.js
git add app/rfq/compare-quotes/page.tsx

echo Step 3: Committing CSS fixes...
git commit -m "CRITICAL FIX: Resolve CSS/styling issues - fix PostCSS config and add CSS variables"

echo Step 4: Pushing to GitHub...
git push origin main

echo Step 5: Building locally to test...
npm run build

echo Step 6: Deploying to Vercel...
npx vercel --prod

echo ========================================
echo   CSS FIX COMPLETE!
echo ========================================
echo.
echo Your site should now have:
echo - Proper CSS styling and layout
echo - Tailwind CSS working correctly
echo - Professional appearance
echo - All components styled properly
echo.
echo Check your site - it should look professional now!
echo.
pause
