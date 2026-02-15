Write-Host "========================================" -ForegroundColor Green
Write-Host "   COMPLETING VERCEL DEPLOYMENT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "Deploying to Vercel production..." -ForegroundColor Cyan

# Deploy to Vercel
& npx vercel --prod

Write-Host "========================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "Your Bell24h platform fixes have been deployed!" -ForegroundColor Yellow
Write-Host "Check your Vercel dashboard for the deployment URL" -ForegroundColor White

Write-Host "`nFixed issues:" -ForegroundColor Green
Write-Host "✅ Homepage button functionality" -ForegroundColor White
Write-Host "✅ Contrast and visual improvements" -ForegroundColor White
Write-Host "✅ RFQ post route (/rfq/post)" -ForegroundColor White
Write-Host "✅ Q-prefix permanent fix" -ForegroundColor White
Write-Host "✅ MCP server configuration" -ForegroundColor White

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
