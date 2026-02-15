@echo off
echo === FIXING DEPLOYMENT ISSUES ===
echo.

echo Step 1: Killing all node processes...
taskkill /F /IM node.exe >nul 2>&1

echo Step 2: Adding fixed workflow files...
git add .github/workflows/ci.yml

echo Step 3: Committing workflow fix...
git commit -m "Fix GitHub Actions workflow - remove failing tests"

echo Step 4: Pushing to GitHub...
git push origin main

echo Step 5: Unlinking wrong Vercel project...
npx vercel unlink --yes

echo Step 6: Linking to correct project (bell24h, NOT bell24h-v1)...
npx vercel link --yes

echo Step 7: Deploying to production...
npx vercel --prod --force

echo.
echo === DEPLOYMENT FIX COMPLETE ===
echo.
echo Next steps:
echo 1. Wait 2 minutes for GitHub Actions to complete
echo 2. Check https://vercel.com/dashboard for bell24h project
echo 3. Visit https://bell24h.com
echo.
echo If still 404, check the deployment logs in Vercel dashboard
echo.
pause
