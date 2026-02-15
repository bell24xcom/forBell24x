# Fix all missing lucide-react icons

$iconReplacements = @{
    'TrendingUp' = 'ArrowUpRight'
    'TrendingDown' = 'ArrowDownRight'
    'Building2' = 'Building'
}

# Find all TypeScript/React files
$files = Get-ChildItem -Path app -Include "*.tsx","*.ts" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($old in $iconReplacements.Keys) {
        if ($content -match $old) {
            $content = $content -replace $old, $iconReplacements[$old]
            $modified = $true
            Write-Host "Fixed $old -> $($iconReplacements[$old]) in $($file.Name)" -ForegroundColor Green
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host "`nCommitting fixes..." -ForegroundColor Yellow
git add -A
git commit -m "Fix missing lucide-react icons"
git push origin main

Write-Host "`nDone! Check Vercel for deployment." -ForegroundColor Green
