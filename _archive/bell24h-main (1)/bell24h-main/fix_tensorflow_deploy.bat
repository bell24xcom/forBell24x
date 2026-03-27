@echo off
echo === FIXING TENSORFLOW DEPENDENCY AND DEPLOYING ===
echo.

echo Step 1: Adding TensorFlow dependency...
git add package.json

echo Step 2: Committing TensorFlow fix...
git commit -m "Add missing @tensorflow/tfjs dependency - deployment ready"

echo Step 3: Pushing to GitHub...
git push origin main

echo.
echo === TENSORFLOW FIX DEPLOYED ===
echo.
echo The build should now succeed! Check Vercel dashboard for progress.
echo Visit https://bell24h.com in 2-3 minutes.
echo.
pause
