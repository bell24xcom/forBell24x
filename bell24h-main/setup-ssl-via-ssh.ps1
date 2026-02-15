# Bell24H SSL Setup - Automated SSH Deployment
# This script automatically connects to your Oracle VM and sets up HTTPS

$ErrorActionPreference = "Stop"

$SSH_KEY = "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key"
$VM_USER = "ubuntu"
$VM_IP = "80.225.192.248"
$SCRIPT_NAME = "setup-ssl-automated.sh"

Write-Host "🔐 Bell24H SSL Setup - Automated Deployment" -ForegroundColor Cyan
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "❌ SSH key not found at: $SSH_KEY" -ForegroundColor Red
    Write-Host "Please update the SSH_KEY path in this script." -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Step 1: Reading setup script..." -ForegroundColor Yellow
$setupScript = Get-Content -Path "setup-ssl-automated.sh" -Raw

Write-Host "📤 Step 2: Uploading and executing setup script on VM..." -ForegroundColor Yellow
Write-Host "   Connecting to: $VM_USER@$VM_IP" -ForegroundColor Gray
Write-Host ""

# Create a temporary script file on the VM and execute it
$remoteScript = @"
$setupScript
"@

# Execute the script via SSH
try {
    $remoteScript | ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VM_USER@$VM_IP "bash -s"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ SSL Setup Completed Successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Your sites are now live with HTTPS:" -ForegroundColor Cyan
        Write-Host "   - https://bell24h.com" -ForegroundColor White
        Write-Host "   - https://www.bell24h.com" -ForegroundColor White
        Write-Host "   - https://app.bell24h.com" -ForegroundColor White
        Write-Host "   - https://n8n.bell24h.com" -ForegroundColor White
        Write-Host ""
        Write-Host "🔒 All sites now have green lock SSL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⏳ Wait 30 seconds, then test in your browser." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "❌ Setup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host "Please check the error messages above." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error connecting to VM:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if SSH key path is correct: $SSH_KEY" -ForegroundColor Gray
    Write-Host "2. Verify VM is accessible: ssh -i `"$SSH_KEY`" $VM_USER@$VM_IP" -ForegroundColor Gray
    exit 1
}

