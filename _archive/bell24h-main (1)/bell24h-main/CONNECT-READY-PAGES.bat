@echo off
echo ========================================
echo   CONNECTING 32 READY PAGES TO LIVE DATA
echo ========================================

echo Step 1: Adding marketplace with live data...
git add app/marketplace/page.tsx

echo Step 2: Adding suppliers with live data...
git add app/suppliers/page.tsx

echo Step 3: Adding categories API...
git add app/api/categories/route.ts

echo Step 4: Adding suppliers API...
git add app/api/suppliers/route.ts

echo Step 5: Committing changes...
git commit -m "feat: connect marketplace and suppliers pages to live data with search and filtering"

echo Step 6: Pushing to GitHub...
git push origin main

echo Step 7: Deploying to Vercel...
npx vercel --prod

echo ========================================
echo   READY PAGES CONNECTED TO LIVE DATA!
echo ========================================
echo.
echo Your marketplace now shows:
echo - Live supplier data with search
echo - Category filtering and stats
echo - Verified supplier badges
echo - Real-time supplier profiles
echo - Direct RFQ creation links
echo.
echo Access at: https://bell24h.com/marketplace
echo Suppliers at: https://bell24h.com/suppliers
echo ========================================
pause
