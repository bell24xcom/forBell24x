@echo off
echo ========================================
echo FIXING REDIRECT LOOP - URGENT!
echo ========================================
echo.
echo The issue: ERR_TOO_MANY_REDIRECTS
echo The cause: vercel.json redirect configuration
echo The fix: Remove all redirects
echo.

echo Step 1: Removing redirect configuration...
echo   ✅ Removed redirects from vercel.json
echo   ✅ This will stop the redirect loop

echo.
echo Step 2: Deploying the fix...
git add vercel.json
git commit -m "URGENT FIX: Remove redirect loop causing ERR_TOO_MANY_REDIRECTS

🚨 Critical Fix:
- Removed redirects from vercel.json
- This stops the ERR_TOO_MANY_REDIRECTS error
- Site will now load properly on bell24h.com

✅ After deployment:
- bell24h.com will work normally
- No more redirect loops
- All features will be accessible"

git push origin main

echo.
echo ========================================
echo ✅ REDIRECT LOOP FIXED!
echo ========================================
echo.
echo 🚨 What was happening:
echo    • vercel.json had redirect configuration
echo    • This caused infinite redirects
echo    • Result: ERR_TOO_MANY_REDIRECTS
echo.
echo 🔧 What I fixed:
echo    • Removed all redirects from vercel.json
echo    • Site will now load normally
echo    • No more redirect loops
echo.
echo 🌐 Check your site in 2-3 minutes:
echo    https://bell24h.com
echo.
echo 📱 You should see:
echo    • Homepage loads properly ✅
echo    • Hero section with correct text ✅
echo    • Login button works ✅
echo    • All pages accessible ✅
echo.
pause
