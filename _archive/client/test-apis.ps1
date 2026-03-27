# PowerShell API Testing Script
# Run this to test BELL24H APIs from command line

Write-Host "🚀 BELL24H API TESTING" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

$baseUrl = "https://bell24h.com"
$endpoints = @(
    @{Name="Health Check"; Path="/api/health"},
    @{Name="Suppliers API"; Path="/api/suppliers"},
    @{Name="RFQ API"; Path="/api/rfq"},
    @{Name="Auth Check Email"; Path="/api/auth/check-email"},
    @{Name="Analytics RFQ Metrics"; Path="/api/analytics/rfq-metrics"},
    @{Name="AI Match"; Path="/api/ai/match"},
    @{Name="Payments Create"; Path="/api/payments/create"},
    @{Name="Voice Transcribe"; Path="/api/voice/transcribe"},
    @{Name="Admin Performance"; Path="/api/admin/performance"},
    @{Name="N8N Test Connection"; Path="/api/n8n/test-connection"}
)

$results = @()
$successCount = 0
$errorCount = 0

Write-Host "`nTesting API endpoints..." -ForegroundColor Yellow

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "Testing $($endpoint.Name)..." -NoNewline
        $response = Invoke-RestMethod -Uri "$baseUrl$($endpoint.Path)" -Method Get -TimeoutSec 10
        Write-Host " ✅ SUCCESS" -ForegroundColor Green
        $results += @{Name=$endpoint.Name; Status="SUCCESS"; Response=$response}
        $successCount++
    } catch {
        Write-Host " ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{Name=$endpoint.Name; Status="ERROR"; Error=$_.Exception.Message}
        $errorCount++
    }
}

Write-Host "`n📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "✅ Successful: $successCount" -ForegroundColor Green
Write-Host "❌ Errors: $errorCount" -ForegroundColor Red
Write-Host "📈 Total: $($endpoints.Count)" -ForegroundColor Blue

if ($errorCount -eq 0) {
    Write-Host "`n🎉 ALL APIs WORKING CORRECTLY!" -ForegroundColor Green
} elseif ($successCount -gt $errorCount) {
    Write-Host "`n⚠️ Most APIs working, some issues detected." -ForegroundColor Yellow
} else {
    Write-Host "`n🚨 Multiple API issues detected!" -ForegroundColor Red
}

Write-Host "`n🔍 Detailed Results:" -ForegroundColor Cyan
foreach ($result in $results) {
    if ($result.Status -eq "SUCCESS") {
        Write-Host "✅ $($result.Name): Working" -ForegroundColor Green
    } else {
        Write-Host "❌ $($result.Name): $($result.Error)" -ForegroundColor Red
    }
}

Write-Host "`n🌐 Test the live website: https://bell24h.com" -ForegroundColor Blue
Write-Host "📊 Check Vercel dashboard: https://vercel.com/dashboard/bell24h-v1" -ForegroundColor Blue
