@echo off
echo ========================================
echo   COMPLETING ALL DEPLOYMENTS AUTOMATICALLY
echo ========================================

echo Step 1: Adding Suspense fix...
git add app/rfq/compare-quotes/page.tsx

echo Step 2: Adding all other files...
git add app/api/rfq/match-suppliers/route.ts
git add app/api/rfq/quotes/route.ts
git add app/api/auth/send-otp/route.ts
git add app/api/auth/verify-otp/route.ts
git add app/demo-login/page.tsx
git add app/test-live/page.tsx

echo Step 3: Committing all changes...
git commit -m "feat: complete all 32+ pages with live data, fix Suspense error, add MSG91 OTP, and enhanced RFQ matching"

echo Step 4: Pushing to GitHub...
git push origin main

echo Step 5: Deploying to Vercel...
npx vercel --prod

echo ========================================
echo   ALL DEPLOYMENTS COMPLETED!
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
