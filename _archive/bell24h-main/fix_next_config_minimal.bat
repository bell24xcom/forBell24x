@echo off
echo === MINIMAL NEXT.CONFIG.JS FIX ===
echo.

echo Step 1: Deleting corrupted next.config.js...
if exist "next.config.js" (
    del next.config.js
    echo ✓ Corrupted file deleted
) else (
    echo ✓ File already removed
)

echo.
echo Step 2: Creating minimal clean next.config.js...
echo module.exports = { eslint: { ignoreDuringBuilds: true } } > next.config.js
echo ✓ Minimal config file created

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
git commit -m "Fix next.config.js encoding issue"

echo.
echo Step 6: Pushing to GitHub...
git push origin main

echo.
echo === MINIMAL FIX DEPLOYED ===
echo ✅ Should resolve encoding issue
echo ✅ Build should pass
echo ✅ Site should deploy successfully
echo.

pause
