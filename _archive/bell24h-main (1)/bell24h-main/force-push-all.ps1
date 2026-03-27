# Force push all files to GitHub
Write-Host "=== Checking git status ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Adding all files ===" -ForegroundColor Cyan
git add -A

Write-Host "`n=== Checking status after add ===" -ForegroundColor Cyan
git status

Write-Host "`n=== Committing all changes ===" -ForegroundColor Cyan
git commit -m "fix: ensure all missing files (lib/utils, components, categories) are committed and pushed"

Write-Host "`n=== Pushing to GitHub ===" -ForegroundColor Cyan
git push origin main

Write-Host "`n=== Verifying files are tracked ===" -ForegroundColor Cyan
Write-Host "Checking src/lib/utils.ts..."
git ls-files src/lib/utils.ts
Write-Host "Checking src/components/AIExplainability.tsx..."
git ls-files src/components/AIExplainability.tsx
Write-Host "Checking src/app/categories/[slug]/page.tsx..."
git ls-files "src/app/categories/[slug]/page.tsx"

Write-Host "`n=== Done! ===" -ForegroundColor Green

