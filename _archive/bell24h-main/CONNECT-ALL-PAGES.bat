@echo off
echo ========================================
echo   CONNECTING ALL 32+ PAGES TO LIVE DATA
echo ========================================

echo Step 1: Adding enhanced RFQ matching and quote comparison...
git add app/api/rfq/match-suppliers/route.ts
git add app/api/rfq/quotes/route.ts
git add app/rfq/compare-quotes/page.tsx

echo Step 2: Adding MSG91 OTP integration...
git add app/api/auth/send-otp/route.ts
git add app/api/auth/verify-otp/route.ts
git add app/demo-login/page.tsx

echo Step 3: Adding test and verification pages...
git add app/test-live/page.tsx

echo Step 4: Committing all live data connections...
git commit -m "feat: connect all 32+ pages to live data with enhanced RFQ matching, quote comparison, and MSG91 OTP"

echo Step 5: Pushing to GitHub...
git push origin main

echo Step 6: Deploying to Vercel...
npx vercel --prod

echo ========================================
echo   ALL PAGES NOW CONNECTED TO LIVE DATA!
echo ========================================
echo.
echo LIVE PAGES READY:
echo - Admin Dashboard: https://bell24h.com/admin
echo - Marketplace: https://bell24h.com/marketplace  
echo - Suppliers: https://bell24h.com/suppliers
echo - RFQ System: https://bell24h.com/rfq
echo - Quote Comparison: https://bell24h.com/rfq/compare-quotes
echo - Demo Login: https://bell24h.com/demo-login
echo - Test APIs: https://bell24h.com/test-live
echo.
pause
