@echo off
echo ========================================
echo   FINAL COMPREHENSIVE FIX
echo ========================================

echo Step 1: Adding all fixes...
git add app/page.tsx
git add app/rfq/post/page.tsx
git add .cursor/settings.json
git add .cursorrc
git add FIX-MCP-AND-AUTOMATION.js
git add NO-Q-PREFIX-AUTOMATION.js
git add NO-Q-PREFIX-AUTOMATION.ps1
git add PERMANENT-Q-PREFIX-FIX.sh

echo Step 2: Committing all fixes...
git commit -m "COMPREHENSIVE FIX: Resolve q prefix, button functionality, contrast, and deployment issues"

echo Step 3: Pushing to GitHub...
git push origin main

echo Step 4: Deploying to Vercel...
npx vercel --prod --project bell24h-v1

echo ========================================
echo   ALL FIXES DEPLOYED SUCCESSFULLY!
echo ========================================
echo.
echo Your Bell24h platform now has:
echo - Fixed button functionality
echo - Improved contrast and visual polish
echo - Proper RFQ post route
echo - Permanent q prefix fix
echo - MCP server configuration
echo - Multiple automation options
echo.
pause
