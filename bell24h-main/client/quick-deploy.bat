@echo off
echo ========================================
echo Bell24H Quick Deploy to Vercel
echo ========================================
echo.

echo Step 1: Installing Vercel CLI...
npm install -g vercel

echo.
echo Step 2: Building project...
npm install
npm run build

echo.
echo Step 3: Deploying to Vercel...
vercel --prod --yes

echo.
echo Step 4: Setting up environment variables...
echo Please set these in your Vercel dashboard:
echo - DATABASE_URL (your Neon database URL)
echo - NEXTAUTH_SECRET (random string)
echo - NEXTAUTH_URL (your Vercel app URL)
echo.

echo Deployment completed!
echo Check your Vercel dashboard for the live URL.
echo.
pause
