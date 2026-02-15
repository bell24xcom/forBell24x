@echo off
echo ========================================
echo   BELL24H SITE VERIFICATION GUIDE
echo ========================================
echo.
echo Opening verification URLs in your browser...
echo.

echo 1. Opening main site: https://bell24h.com
start https://bell24h.com

timeout /t 3 /nobreak > nul

echo 2. Opening Vercel deployment URL...
start https://bell24h-v1-qi0mgdkog-vishaals-projects-892b178d.vercel.app

timeout /t 3 /nobreak > nul

echo 3. Opening Vercel dashboard...
start https://vercel.com/vishaals-projects-892b178d/bell24h-v1/deployments

echo.
echo ========================================
echo   VERIFICATION CHECKLIST:
echo ========================================
echo.
echo PLEASE CHECK THESE ON YOUR WEBSITE:
echo.
echo [ ] 1. Homepage loads without errors
echo [ ] 2. Hero section displays properly
echo [ ] 3. Navigation menu works
echo [ ] 4. "Login/Join Free" button opens OTP modal
echo [ ] 5. Mobile OTP form accepts 10-digit numbers
echo [ ] 6. Category sections are visible
echo [ ] 7. Search bar is functional
echo [ ] 8. RFQ ticker is rotating
echo [ ] 9. Footer links work
echo [ ] 10. Site is mobile responsive
echo.
echo ========================================
echo   RESULT: Mark each item as you verify
echo ========================================
pause
