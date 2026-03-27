# PowerShell script to commit and push the onboarding fix
cd C:\Users\Sanika\Projects\bell24h\client
git add src/app/admin/onboarding/page.tsx
git commit -m "Fix: Type error in onboarding page selectedProgram state"
git push origin main
Write-Host "Fix committed and pushed successfully!" -ForegroundColor Green
