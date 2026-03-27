@echo off
echo Fixing Vercel deployment configuration...
git add vercel.json
git commit -m "Fix Vercel config - remove invalid redirects and client directory references"
git push origin main
echo.
echo Configuration fixed! Vercel should now auto-deploy successfully.
echo Check https://vercel.com/dashboard for deployment status.
echo.
pause
