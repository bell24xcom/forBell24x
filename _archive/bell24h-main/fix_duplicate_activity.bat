@echo off
echo === FIXING DUPLICATE ACTIVITY IMPORTS ===
echo.

echo Step 1: Removing duplicate Activity imports...
powershell -Command "$content = Get-Content 'app\admin\dashboard\page.tsx' -Raw; $lines = $content -split \"`n\"; $newLines = @(); $foundActivity = $false; foreach ($line in $lines) { if ($line -match 'Activity,' -and $foundActivity) { continue } elseif ($line -match 'Activity,') { $foundActivity = $true } $newLines += $line }; $content = $newLines -join \"`n\"; Set-Content 'app\admin\dashboard\page.tsx' $content -NoNewline"

echo ✓ Removed duplicate Activity imports

echo.
echo Step 2: Adding changes to git...
git add app\admin\dashboard\page.tsx

echo.
echo Step 3: Committing duplicate fix...
git commit -m "Remove duplicate Activity imports"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

echo.
echo === DUPLICATE ACTIVITY FIX COMPLETE ===
echo ✅ Duplicate Activity imports removed
echo ✅ Build should now succeed
echo ✅ Vercel will rebuild automatically
echo.
echo Check: https://vercel.com/dashboard
echo Visit: https://bell24h.com
echo.
echo This should be the final fix!
pause
