@echo off
echo Fixing Bell24h deployment issues...

git add app/page.tsx
git add app/rfq/post/page.tsx
git add .cursor/settings.json
git add .cursorrc

git commit -m "fix: comprehensive homepage fix with button functionality, contrast improvements, and q prefix fix"

git push origin main

npx vercel --prod --project bell24h-v1

echo Fix complete!
pause
