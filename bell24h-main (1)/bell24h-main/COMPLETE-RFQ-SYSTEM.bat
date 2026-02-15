@echo off
echo ========================================
echo   COMPLETING RFQ SYSTEM FOR DUAL-ROLE USERS
echo ========================================

echo Step 1: Adding dual-role user system...
git add app/auth/register/page.tsx
git add components/RoleSwitcher.tsx

echo Step 2: Updating RFQ creation form...
git add app/rfq/create/page.tsx

echo Step 3: Committing changes...
git commit -m "feat: complete RFQ system with dual-role users (suppliers can be buyers)"

echo Step 4: Pushing to GitHub...
git push origin main

echo Step 5: Deploying to Vercel...
npx vercel --prod --project bell24h-v1

echo ========================================
echo   RFQ SYSTEM COMPLETED!
echo ========================================
echo.
echo Your RFQ system now supports:
echo - Users register as SUPPLIERS by default
echo - Same users can switch to BUYER mode
echo - Complete RFQ creation form
echo - Real-time form validation
echo - Professional UI/UX
echo.
echo Access at: https://bell24h.com/rfq/create
echo ========================================
pause
