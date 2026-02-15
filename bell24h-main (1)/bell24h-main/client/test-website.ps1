# Automated Website Verification Script
# Run this in PowerShell to test the live website

Write-Host "🚀 BELL24H WEBSITE VERIFICATION" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Test main website
Write-Host "`n1. Testing main website..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://bell24h.com" -Method Head -TimeoutSec 10
    Write-Host "✅ Main website accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Main website error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test key pages
$pages = @(
    @{Name="Login Page"; URL="https://bell24h.com/auth/login"},
    @{Name="Suppliers Page"; URL="https://bell24h.com/suppliers"},
    @{Name="RFQ Page"; URL="https://bell24h.com/rfq"},
    @{Name="Admin Page"; URL="https://bell24h.com/admin"},
    @{Name="Dashboard"; URL="https://bell24h.com/dashboard"}
)

Write-Host "`n2. Testing key pages..." -ForegroundColor Yellow
foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri $page.URL -Method Head -TimeoutSec 10
        Write-Host "✅ $($page.Name): $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($page.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test API endpoints
Write-Host "`n3. Testing API endpoints..." -ForegroundColor Yellow
$apis = @(
    @{Name="Health API"; URL="https://bell24h.com/api/health"},
    @{Name="Suppliers API"; URL="https://bell24h.com/api/suppliers"},
    @{Name="RFQ API"; URL="https://bell24h.com/api/rfq"}
)

foreach ($api in $apis) {
    try {
        $response = Invoke-WebRequest -Uri $api.URL -Method Head -TimeoutSec 10
        Write-Host "✅ $($api.Name): $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($api.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 VERIFICATION COMPLETE!" -ForegroundColor Cyan
Write-Host "Check Vercel dashboard: https://vercel.com/dashboard/bell24h-v1" -ForegroundColor Blue
Write-Host "Test live website: https://bell24h.com" -ForegroundColor Blue
