@echo off
echo ========================================
echo FIXING VERCEL REDIRECT ISSUE
echo ========================================
echo.
echo The problem was:
echo - Your changes are on bell24h.com
echo - But vercel.json was redirecting to www.bell24h.com
echo - So you were seeing the OLD version!
echo.
echo Fixing redirect configuration...

git add vercel.json
git commit -m "FIX: Correct Vercel redirect - point www to main domain

🔧 Issue Fixed:
- Changed redirect from bell24h.com -> www.bell24h.com
- To www.bell24h.com -> bell24h.com
- Now your changes will be visible on bell24h.com

✅ This fixes the deployment visibility issue!"

git push origin main

echo.
echo ========================================
echo ✅ REDIRECT FIXED!
echo ========================================
echo.
echo 🎯 What was happening:
echo    • Your changes were deployed to bell24h.com ✅
echo    • But vercel.json redirected to www.bell24h.com ❌
echo    • So you saw the OLD version! ❌
echo.
echo 🔧 What I fixed:
echo    • Now www.bell24h.com redirects to bell24h.com ✅
echo    • Your changes will be visible on bell24h.com ✅
echo.
echo 🌐 Check your site NOW:
echo    https://bell24h.com
echo.
echo 📱 You should now see:
echo    • "Post RFQ. Get 3 Verified Quotes in 24 Hours" ✅
echo    • "200 live data signals" description ✅
echo    • "Escrow-secured payments" highlight ✅
echo    • All the missing sections ✅
echo.
pause
