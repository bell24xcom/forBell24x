@echo off
echo === COMMITTING MERGE CONFLICT FIXES ===
echo.

echo Adding fixed files...
git add src/app/api/voice/rfq/route.ts
git add client/src/app/legal/terms-of-service/page.tsx
git add lib/prisma.ts
git add .eslintrc.json
git add .vercelignore
git add package.json

echo.
echo Committing merge conflict fixes...
git commit -m "Fix merge conflicts in rfq route and terms page, add prisma client"

echo.
echo Pushing to GitHub...
git push origin main

echo.
echo === MERGE FIXES COMMITTED ===
echo.

pause
