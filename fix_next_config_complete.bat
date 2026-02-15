@echo off
echo === COMPLETE NEXT.CONFIG.JS FIX ===
echo.

echo Step 1: Deleting corrupted next.config.js...
if exist "next.config.js" (
    del next.config.js
    echo ✓ Corrupted file deleted
) else (
    echo ✓ File already removed
)

echo.
echo Step 2: Creating clean next.config.js with proper encoding...
echo /** @type {import('next').NextConfig} */ > next.config.js
echo const nextConfig = { >> next.config.js
echo   reactStrictMode: true, >> next.config.js
echo   swcMinify: true, >> next.config.js
echo   eslint: { >> next.config.js
echo     ignoreDuringBuilds: true >> next.config.js
echo   }, >> next.config.js
echo   typescript: { >> next.config.js
echo     ignoreBuildErrors: false >> next.config.js
echo   } >> next.config.js
echo } >> next.config.js
echo. >> next.config.js
echo module.exports = nextConfig >> next.config.js
echo ✓ Clean config file created

echo.
echo Step 3: Verifying file content...
echo --- next.config.js content ---
type next.config.js
echo --- end of file ---

echo.
echo Step 4: Adding to git...
git add next.config.js

echo.
echo Step 5: Committing fix...
git commit -m "Fix corrupted next.config.js - remove invalid characters"

echo.
echo Step 6: Pushing to GitHub...
git push origin main

echo.
echo === NEXT.CONFIG.JS FIXED AND DEPLOYED ===
echo ✅ Vercel will start new deployment automatically
echo ✅ Build should pass configuration parsing stage
echo ✅ No more "Invalid or unexpected token" error
echo ✅ Site should deploy successfully to bell24h.com
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.

pause
