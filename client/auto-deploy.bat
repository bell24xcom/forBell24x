@echo off
echo ========================================
echo Bell24H Automated Deployment
echo ========================================
echo.

echo Step 1: Installing dependencies...
npm install

echo.
echo Step 2: Running automated setup...
node scripts/automated-setup.js

echo.
echo Step 3: Committing changes to Git...
git add .
git commit -m "feat: Automated deployment with comprehensive B2B marketplace system"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo Step 5: Deploying to Vercel...
node scripts/automated-deployment.js

echo.
echo Deployment completed!
echo Check your Vercel dashboard for the live URL.
echo.
pause
