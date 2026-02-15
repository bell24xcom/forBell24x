# PowerShell script - no quotes issue
Write-Host "Deploying Hero + SEO fixes..." -ForegroundColor Green

Write-Host "Adding all changes..." -ForegroundColor Yellow
git add -A

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "CRITICAL FIX: Hero Section + SEO/AEO + Missing Pages

🎯 Hero Section Fixed:
- Added 'Post RFQ. Get 3 Verified Quotes in 24 Hours'
- Added '200 live data signals' description  
- Added 'Escrow-secured payments' highlight
- Improved text hierarchy and contrast

🔍 SEO/AEO Optimization:
- Added comprehensive meta tags
- Added structured data (JSON-LD)
- Added Open Graph tags
- Added Twitter cards
- Added keyword optimization

📱 Missing Pages Created:
- /products page with category grid
- /suppliers/manufacturers page
- Branded 404 error page

🎨 Design Improvements:
- Header now sleek and compact
- Better color contrast
- Improved text readability

🔧 Cursor Rules Added:
- Fixed 'q' prefix issue in .cursorrules"

Write-Host "Pushing to deploy..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Your site will update in 2-3 minutes at https://bell24h.com" -ForegroundColor Cyan
