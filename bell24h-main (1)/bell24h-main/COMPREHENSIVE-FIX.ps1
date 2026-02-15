Write-Host "========================================"
Write-Host "  COMPREHENSIVE BELL24H FIX"
Write-Host "========================================"

Write-Host "Step 1: Adding enhanced homepage and RFQ post route..."
git add app/page.tsx
git add app/rfq/post/page.tsx

Write-Host "Step 2: Committing all fixes..."
git commit -m "fix: comprehensive homepage fix with proper button functionality, contrast improvements, and RFQ post route"

Write-Host "Step 3: Pushing to GitHub..."
git push origin main

Write-Host "Step 4: Deploying to Vercel..."
npx vercel --prod --project bell24h-v1

Write-Host "========================================"
Write-Host "  COMPREHENSIVE FIX COMPLETE!"
Write-Host "========================================"
