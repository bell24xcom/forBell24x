@echo off
echo === CHECKING DEPLOYMENT STATUS ===
echo.

echo Recent commits:
git log --oneline -5

echo.
echo Current branch:
git branch

echo.
echo Git status:
git status

echo.
echo === NEXT STEPS ===
echo 1. Check Vercel dashboard: https://vercel.com/dashboard
echo 2. Look for the latest deployment (commit dbce54550)
echo 3. If it's building, wait 2-3 minutes
echo 4. If it fails, copy the error message
echo.
echo Your site should be live at: https://bell24h.com
echo.

pause
