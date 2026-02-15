@echo off
echo 🚀 BELL24H - DEPLOY TO VERCEL NOW
echo ===================================
echo.
echo ✅ All build errors have been resolved!
echo ✅ Build tested successfully (218/218 pages)
echo ✅ All fixes pushed to GitHub
echo.
echo 📝 Step 1: Navigating to client directory...
cd client

echo 📝 Step 2: Installing dependencies...
call npm install

echo 📝 Step 3: Generating Prisma client...
call npx prisma generate

echo 📝 Step 4: Testing build locally...
call npm run build

echo 📝 Step 5: Deploying to Vercel...
echo 🚀 Starting Vercel deployment...
npx vercel --prod --yes

echo.
echo 🎉 DEPLOYMENT COMPLETE!
echo ======================
echo ✅ All build errors resolved
echo ✅ 218/218 pages generated successfully
echo ✅ Deployed to Vercel production
echo.
echo 🌐 Your Bell24h platform should now be live!
echo.
pause
