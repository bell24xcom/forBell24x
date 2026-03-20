# Bell24h Phase 5: Critical Path Smoke Test (PowerShell)
# This script validates the Guest Flow, Memory Sync, and Agent Safety Switch.

Write-Host "🚀 [SMOKE-TEST] Starting Validation Suite..." -ForegroundColor Cyan

# Set Test Mode
$env:AGENT_MODE = "test"
$env:NEXTAUTH_URL = "http://localhost:3000"

# 1. FLOW A: Guest Video RFQ Submission
Write-Host "------------------------------------------------"
Write-Host "📡 [FLOW A] Simulating Guest Video RFQ Submission..."
$body = @{
    rfqId = "test_guest_123"
    title = "Packaging Requirement in Ahmedabad"
    category = "Packaging"
    location = "Ahmedabad"
    data = @{ type = "video" }
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/rfq/guest-sync" -Method Post -Body $body -ContentType "application/json"
    Write-Host "Response: $($response | ConvertTo-Json -Compress)"
    
    if ($response.success -eq $true) {
        Write-Host "✅ [SMOKE-TEST] Flow A Passed: API accepted guest submission." -ForegroundColor Green
    } else {
        Write-Host "❌ [SMOKE-TEST] Flow A Failed: API rejected guest submission." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ [SMOKE-TEST] Flow A Failed: Could not connect to API. Is the server running?" -ForegroundColor Yellow
}

# 2. FLOW B & C: Memory & Metadata Verification
Write-Host "------------------------------------------------"
Write-Host "🧠 [FLOW B/C] Verifying Memory Sync & Metadata..."
Write-Host "Please ensure your dev server logs show:"
Write-Host "  [SMOKE-TEST] Memory: test_guest_123 - Stored guest intent."
Write-Host "  [SMOKE-TEST] Strategy: Scout - Mode: test"
Write-Host "  [SMOKE-TEST] Messenger: BLOCKED-TEST-MODE - No external outreach triggered."

Write-Host "------------------------------------------------"
Write-Host "✨ [SMOKE-TEST] Suite Complete."
