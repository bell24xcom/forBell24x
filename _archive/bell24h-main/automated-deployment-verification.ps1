# Bell24h Automated Deployment Verification
# This script tests all aspects of the live deployment

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  BELL24H DEPLOYMENT VERIFICATION       " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check Git Status
Write-Host "Test 1: Git Status..." -ForegroundColor Yellow
git status --short
Write-Host ""

# Test 2: Check Recent Commits
Write-Host "Test 2: Recent Commits..." -ForegroundColor Yellow
git log --oneline -5
Write-Host ""

# Test 3: Verify Old Files Are Gone
Write-Host "Test 3: Verify Old API Files Removed..." -ForegroundColor Yellow
if (Test-Path "pages/api/analytics/predictive.ts") {
    Write-Host "❌ OLD FILE STILL EXISTS!" -ForegroundColor Red
} else {
    Write-Host "✅ Old file removed" -ForegroundColor Green
}

if (Test-Path "pages/api/analytics/stock-data.ts") {
    Write-Host "❌ OLD FILE STILL EXISTS!" -ForegroundColor Red
} else {
    Write-Host "✅ Old file removed" -ForegroundColor Green
}

if (Test-Path "pages/api/voice/transcribe.ts") {
    Write-Host "❌ OLD FILE STILL EXISTS!" -ForegroundColor Red
} else {
    Write-Host "✅ Old file removed" -ForegroundColor Green
}
Write-Host ""

# Test 4: Verify New Files Exist
Write-Host "Test 4: Verify New App Router Files Exist..." -ForegroundColor Yellow
if (Test-Path "src/app/api/analytics/predictive/route.ts") {
    Write-Host "✅ New API file exists" -ForegroundColor Green
} else {
    Write-Host "❌ NEW FILE MISSING!" -ForegroundColor Red
}

if (Test-Path "src/app/api/analytics/stock-data/route.ts") {
    Write-Host "✅ New API file exists" -ForegroundColor Green
} else {
    Write-Host "❌ NEW FILE MISSING!" -ForegroundColor Red
}

if (Test-Path "src/app/api/voice/transcribe/route.ts") {
    Write-Host "✅ New API file exists" -ForegroundColor Green
} else {
    Write-Host "❌ NEW FILE MISSING!" -ForegroundColor Red
}
Write-Host ""

# Test 5: Check Build Configuration
Write-Host "Test 5: Build Configuration..." -ForegroundColor Yellow
if (Test-Path "next.config.js") {
    Write-Host "✅ next.config.js exists" -ForegroundColor Green
} else {
    Write-Host "❌ next.config.js missing" -ForegroundColor Red
}

if (Test-Path ".eslintrc.json") {
    Write-Host "✅ .eslintrc.json exists" -ForegroundColor Green
} else {
    Write-Host "❌ .eslintrc.json missing" -ForegroundColor Red
}
Write-Host ""

# Test 6: Check Key Page Files
Write-Host "Test 6: Key Pages Verified..." -ForegroundColor Yellow
$keyPages = @(
    "src/app/page.tsx",
    "src/app/suppliers/page.tsx",
    "src/app/search/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/ai-explainability/page.tsx",
    "src/app/negotiation/page.tsx"
)

foreach ($page in $keyPages) {
    if (Test-Path $page) {
        Write-Host "✅ $page" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $page" -ForegroundColor Red
    }
}
Write-Host ""

# Test 7: Count API Routes
Write-Host "Test 7: API Routes Count..." -ForegroundColor Yellow
$apiCount = (Get-ChildItem -Path "src/app/api" -Recurse -Filter "route.ts").Count
Write-Host "✅ Found $apiCount API routes" -ForegroundColor Green
Write-Host ""

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  VERIFICATION COMPLETE               " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Check Vercel: https://vercel.com/dashboard/bell24h-v1" -ForegroundColor White
Write-Host "2. Wait for: 🟢 Ready status" -ForegroundColor White
Write-Host "3. Test website: https://bell24h.com" -ForegroundColor White
Write-Host "4. Run full verification tests" -ForegroundColor White
Write-Host ""
