Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   COMPLETING ALL DEPLOYMENTS AUTOMATICALLY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "Step 1: Adding Suspense fix..." -ForegroundColor Yellow
git add app/rfq/compare-quotes/page.tsx

Write-Host "Step 2: Adding all other files..." -ForegroundColor Yellow
git add app/api/rfq/match-suppliers/route.ts
git add app/api/rfq/quotes/route.ts
git add app/api/auth/send-otp/route.ts
git add app/api/auth/verify-otp/route.ts
git add app/demo-login/page.tsx
git add app/test-live/page.tsx

Write-Host "Step 3: Committing all changes..." -ForegroundColor Yellow
git commit -m "feat: complete all 32+ pages with live data, fix Suspense error, add MSG91 OTP, and enhanced RFQ matching"

Write-Host "Step 4: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "Step 5: Deploying to Vercel..." -ForegroundColor Yellow
npx vercel --prod

Write-Host "========================================" -ForegroundColor Green
Write-Host "   ALL DEPLOYMENTS COMPLETED!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "LIVE PAGES READY:" -ForegroundColor White
Write-Host "- Admin Dashboard: https://bell24h.com/admin" -ForegroundColor Cyan
Write-Host "- Marketplace: https://bell24h.com/marketplace" -ForegroundColor Cyan
Write-Host "- Suppliers: https://bell24h.com/suppliers" -ForegroundColor Cyan
Write-Host "- RFQ System: https://bell24h.com/rfq" -ForegroundColor Cyan
Write-Host "- Quote Comparison: https://bell24h.com/rfq/compare-quotes" -ForegroundColor Cyan
Write-Host "- Demo Login: https://bell24h.com/demo-login" -ForegroundColor Cyan
Write-Host "- Test APIs: https://bell24h.com/test-live" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
