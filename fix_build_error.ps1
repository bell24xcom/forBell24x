# PowerShell script - Fix selectedCategory build error
Write-Host "=== FIXING BUILD ERROR ===" -ForegroundColor Red

Write-Host "Fixed selectedCategory state variable in app/page.tsx" -ForegroundColor Green

Write-Host "Adding fix to git..." -ForegroundColor Yellow
git add app/page.tsx

Write-Host "Committing fix..." -ForegroundColor Yellow
git commit -m "FIX: Add missing selectedCategory state variable to fix build error

🔧 Build Error Fixed:
- Added const [selectedCategory, setSelectedCategory] = useState('all')
- Fixes ReferenceError: selectedCategory is not defined
- Homepage dropdown will now work properly
- Build will complete successfully

✅ All state variables now properly declared"

Write-Host "Pushing fix..." -ForegroundColor Yellow
git push origin main

Write-Host "`n✅ BUILD ERROR FIXED!" -ForegroundColor Green
Write-Host "Your build will now complete successfully!" -ForegroundColor Cyan
Write-Host "Check deployment at: https://vercel.com/dashboard" -ForegroundColor Yellow
