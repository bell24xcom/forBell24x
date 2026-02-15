# start_clean_dev.ps1
Set-StrictMode -Version Latest
$proj = "C:\Users\Sanika\Projects\bell24h"
$ports = @(3000,3001)

Write-Host "=== START: Clean restart for Bell24h dev server ===" -ForegroundColor Cyan

# 1) Kill node processes
Write-Host "Killing node processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction Stop
        Write-Host "Stopped node pid $($_.Id)"
    } catch {
        Write-Host "Could not stop node pid $($_.Id): $_" -ForegroundColor Red
    }
}

# 2) Make sure ports are free
foreach ($p in $ports) {
    $pids = (netstat -ano | Select-String ":$p\s" | ForEach-Object {
        ($_ -split "\s+")[-1]
    }) | Select-Object -Unique
    foreach ($pid in $pids) {
        if ($pid -and $pid -ne "0") {
            try {
                Stop-Process -Id $pid -Force -ErrorAction Stop
                Write-Host "Freed port $p by killing pid $pid"
            } catch {
                Write-Host "Unable to kill pid $pid for port $p: $($_)" -ForegroundColor Red
            }
        }
    }
}

# 3) Optional: Remove .next and Tailwind cache (force rebuild)
Write-Host "Cleaning build cache (.next, node_modules/.cache/tailwindcss)..." -ForegroundColor Yellow
if (Test-Path "$proj\.next") { Remove-Item "$proj\.next" -Recurse -Force -ErrorAction SilentlyContinue }
if (Test-Path "$proj\node_modules\.cache") { Remove-Item "$proj\node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue }

# 4) Ensure working directory
Set-Location $proj
Write-Host "Working directory: $(Get-Location)" -ForegroundColor Green

# 5) Optional: Install missing deps (fast check)
if (Test-Path "$proj\package.json") {
    Write-Host "Checking node_modules..." -ForegroundColor Yellow
    if (-not (Test-Path "$proj\node_modules")) {
        Write-Host "node_modules not present. Running npm ci (or npm install)..." -ForegroundColor Yellow
        npm ci
    }
}

# 6) Start the project (using Start-Bell24h command)
Write-Host "Starting Bell24h dev server..." -ForegroundColor Cyan
# Use Start-Process to keep the window responsive
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-Command","& { Set-Location '$proj'; . '.\Start-Bell24h.ps1' }" -WorkingDirectory $proj

Write-Host "Bell24h dev server started in a new PowerShell window. Wait for 'Ready' or 'compiled' messages." -ForegroundColor Green
Write-Host "If Start-Bell24h.ps1 doesn't exist, falling back to npm run dev..." -ForegroundColor Yellow

# Fallback to npm run dev if Start-Bell24h.ps1 doesn't exist
if (-not (Test-Path "$proj\Start-Bell24h.ps1")) {
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-Command","npm run dev" -WorkingDirectory $proj
}
