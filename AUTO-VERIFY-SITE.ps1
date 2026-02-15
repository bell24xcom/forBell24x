# Automated Site Verification Script for Bell24H
Write-Host "🔍 AUTOMATED BELL24H SITE VERIFICATION STARTING..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

# URLs to test
$mainSite = "https://bell24h.com"
$vercelSite = "https://bell24h-v1-qi0mgdkog-vishaals-projects-892b178d.vercel.app"

# Results array
$results = @()

Write-Host "📊 Testing Site Availability..." -ForegroundColor Cyan

# Test 1: Main Site Availability
try {
    $response = Invoke-WebRequest -Uri $mainSite -TimeoutSec 10 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Main site (bell24h.com) is LIVE and responding" -ForegroundColor Green
        $results += "✅ Main Site: WORKING (Status: $($response.StatusCode))"
    }
    
    # Check for key HTML elements
    $content = $response.Content
    if ($content -match "Bell24H|B2B|marketplace") {
        Write-Host "✅ Site content looks correct (contains B2B marketplace content)" -ForegroundColor Green
        $results += "✅ Content Check: PASSED"
    } else {
        Write-Host "❌ Site content may be incorrect" -ForegroundColor Red
        $results += "❌ Content Check: FAILED"
    }
} catch {
    Write-Host "❌ Main site is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Main Site: FAILED - $($_.Exception.Message)"
}

# Test 2: Vercel Site Availability
try {
    $vercelResponse = Invoke-WebRequest -Uri $vercelSite -TimeoutSec 10 -UseBasicParsing
    if ($vercelResponse.StatusCode -eq 200) {
        Write-Host "✅ Vercel deployment URL is working" -ForegroundColor Green
        $results += "✅ Vercel URL: WORKING (Status: $($vercelResponse.StatusCode))"
    }
} catch {
    Write-Host "❌ Vercel site not accessible: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ Vercel URL: FAILED - $($_.Exception.Message)"
}

# Test 3: Response Time Check
Write-Host "⏱️ Testing Response Times..." -ForegroundColor Cyan
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri $mainSite -TimeoutSec 30 -UseBasicParsing
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 3000) {
        Write-Host "✅ Fast response time: $responseTime ms" -ForegroundColor Green
        $results += "✅ Speed: EXCELLENT ($responseTime ms)"
    } elseif ($responseTime -lt 5000) {
        Write-Host "⚠️ Moderate response time: $responseTime ms" -ForegroundColor Yellow
        $results += "⚠️ Speed: GOOD ($responseTime ms)"
    } else {
        Write-Host "❌ Slow response time: $responseTime ms" -ForegroundColor Red
        $results += "❌ Speed: SLOW ($responseTime ms)"
    }
} catch {
    Write-Host "❌ Could not measure response time" -ForegroundColor Red
    $results += "❌ Speed Test: FAILED"
}

# Test 4: SSL Certificate Check
Write-Host "🔒 Checking SSL Certificate..." -ForegroundColor Cyan
try {
    $uri = [System.Uri]$mainSite
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.Connect($uri.Host, 443)
    $sslStream = New-Object System.Net.Security.SslStream($tcpClient.GetStream())
    $sslStream.AuthenticateAsClient($uri.Host)
    
    if ($sslStream.IsAuthenticated) {
        Write-Host "✅ SSL Certificate is valid" -ForegroundColor Green
        $results += "✅ SSL: SECURE"
    }
    
    $sslStream.Close()
    $tcpClient.Close()
} catch {
    Write-Host "❌ SSL Certificate issue: $($_.Exception.Message)" -ForegroundColor Red
    $results += "❌ SSL: ISSUE"
}

# Test 5: Check for Common React/Next.js Elements
Write-Host "⚛️ Checking for React/Next.js Framework..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $mainSite -TimeoutSec 10 -UseBasicParsing
    $content = $response.Content
    
    if ($content -match "_next|__NEXT_DATA__|react") {
        Write-Host "✅ Next.js/React framework detected" -ForegroundColor Green
        $results += "✅ Framework: Next.js/React DETECTED"
    } else {
        Write-Host "⚠️ Next.js/React framework not clearly detected" -ForegroundColor Yellow
        $results += "⚠️ Framework: Not clearly detected"
    }
} catch {
    Write-Host "❌ Could not check framework" -ForegroundColor Red
    $results += "❌ Framework Check: FAILED"
}

# Test 6: Mobile Responsiveness Check (Meta Viewport)
Write-Host "📱 Checking Mobile Responsiveness..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $mainSite -TimeoutSec 10 -UseBasicParsing
    $content = $response.Content
    
    if ($content -match 'viewport.*width=device-width') {
        Write-Host "✅ Mobile responsive meta tags found" -ForegroundColor Green
        $results += "✅ Mobile: RESPONSIVE"
    } else {
        Write-Host "⚠️ Mobile responsive meta tags not found" -ForegroundColor Yellow
        $results += "⚠️ Mobile: May not be responsive"
    }
} catch {
    Write-Host "❌ Could not check mobile responsiveness" -ForegroundColor Red
    $results += "❌ Mobile Check: FAILED"
}

# Generate Final Report
Write-Host "`n🎯 AUTOMATED VERIFICATION COMPLETE!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "📋 FINAL REPORT:" -ForegroundColor White

foreach ($result in $results) {
    Write-Host $result
}

# Summary
$passCount = ($results | Where-Object { $_ -match "✅" }).Count
$failCount = ($results | Where-Object { $_ -match "❌" }).Count
$warnCount = ($results | Where-Object { $_ -match "⚠️" }).Count

Write-Host "`n📊 SUMMARY:" -ForegroundColor White
Write-Host "✅ Passed: $passCount tests" -ForegroundColor Green
Write-Host "⚠️ Warnings: $warnCount tests" -ForegroundColor Yellow
Write-Host "❌ Failed: $failCount tests" -ForegroundColor Red

if ($failCount -eq 0 -and $warnCount -le 1) {
    Write-Host "`n🎉 OVERALL STATUS: EXCELLENT! Your site is working perfectly!" -ForegroundColor Green
} elseif ($failCount -le 1) {
    Write-Host "`n✅ OVERALL STATUS: GOOD! Your site is mostly working well!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ OVERALL STATUS: NEEDS ATTENTION! Some issues detected!" -ForegroundColor Yellow
}

# Open the site for visual inspection
Write-Host "`n🌐 Opening your site for visual inspection..." -ForegroundColor Cyan
Start-Process $mainSite

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
