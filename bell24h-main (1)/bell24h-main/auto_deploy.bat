@echo off
echo Starting automatic deployment to Vercel...
echo.

echo Step 1: Checking git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
git commit -m "Deploy to production: Fix API database errors and add missing routes"
echo.

echo Step 4: Pushing to main branch...
git push origin main
echo.

echo Deployment triggered! Your app will be live on Vercel shortly.
echo Visit: https://bell24h.com or check your Vercel dashboard
echo.

pause
