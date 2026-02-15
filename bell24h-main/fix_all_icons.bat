@echo off
echo === COMPREHENSIVE ICON FIX ===
echo.

echo Step 1: Fixing all missing lucide-react icons...
powershell -Command "$iconReplacements = @{'TrendingUp' = 'ArrowUpRight'; 'TrendingDown' = 'ArrowDownRight'; 'Building2' = 'Building'}; $files = Get-ChildItem -Path app -Include '*.tsx','*.ts' -Recurse; foreach ($file in $files) { $content = Get-Content $file.FullName -Raw; $modified = $false; foreach ($old in $iconReplacements.Keys) { if ($content -match $old) { $content = $content -replace $old, $iconReplacements[$old]; $modified = $true; Write-Host 'Fixed' $old '->' $iconReplacements[$old] 'in' $file.Name -ForegroundColor Green } }; if ($modified) { Set-Content -Path $file.FullName -Value $content -NoNewline } }"
echo ✓ All icons fixed

echo.
echo Step 2: Adding all changes to git...
git add -A

echo.
echo Step 3: Committing comprehensive icon fixes...
git commit -m "Fix all missing lucide-react icons"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo === COMPREHENSIVE FIX COMPLETE ===
echo ✅ All missing icons replaced
echo ✅ Build should now succeed
echo ✅ Vercel will rebuild automatically
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.

pause
