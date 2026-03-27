# Bell24H SSL Setup - Upload and Execute Script
# This script uploads the setup script to VM and executes it

$ErrorActionPreference = "Stop"

$SSH_KEY = "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key"
$VM_USER = "ubuntu"
$VM_IP = "80.225.192.248"
$SCRIPT_FILE = "setup-ssl-automated.sh"
$REMOTE_SCRIPT = "/tmp/setup-ssl-automated.sh"

Write-Host "[SSL SETUP] Bell24H SSL Setup - Automated Deployment" -ForegroundColor Cyan
Write-Host ""

# Check if SSH key exists
if (-not (Test-Path $SSH_KEY)) {
    Write-Host "[ERROR] SSH key not found at: $SSH_KEY" -ForegroundColor Red
    exit 1
}

# Check if script file exists
if (-not (Test-Path $SCRIPT_FILE)) {
    Write-Host "[ERROR] Script file not found: $SCRIPT_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 1] Uploading setup script to VM..." -ForegroundColor Yellow
try {
    # Upload script using scp
    scp -i $SSH_KEY -o StrictHostKeyChecking=no $SCRIPT_FILE "${VM_USER}@${VM_IP}:${REMOTE_SCRIPT}"
    
    if ($LASTEXITCODE -ne 0) {
        throw "SCP upload failed with exit code: $LASTEXITCODE"
    }
    
    Write-Host "[SUCCESS] Script uploaded successfully" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "[STEP 2] Executing setup script on VM..." -ForegroundColor Yellow
    Write-Host ""
    
    # Execute the script
    ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VM_USER@$VM_IP "chmod +x $REMOTE_SCRIPT && sudo bash $REMOTE_SCRIPT"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[SUCCESS] SSL Setup Completed Successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your sites are now live with HTTPS:" -ForegroundColor Cyan
        Write-Host "   - https://bell24h.com" -ForegroundColor White
        Write-Host "   - https://www.bell24h.com" -ForegroundColor White
        Write-Host "   - https://app.bell24h.com" -ForegroundColor White
        Write-Host "   - https://n8n.bell24h.com" -ForegroundColor White
        Write-Host ""
        Write-Host "[SUCCESS] All sites now have green lock SSL!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Wait 30 seconds, then test in your browser." -ForegroundColor Yellow
        
        # Clean up remote script
        Write-Host ""
        Write-Host "[CLEANUP] Removing temporary script from VM..." -ForegroundColor Gray
        ssh -i $SSH_KEY -o StrictHostKeyChecking=no $VM_USER@$VM_IP "rm -f $REMOTE_SCRIPT" | Out-Null
    } else {
        Write-Host ""
        Write-Host "[ERROR] Setup failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Check if SSH key path is correct: $SSH_KEY" -ForegroundColor Gray
    Write-Host "2. Verify VM is accessible" -ForegroundColor Gray
    Write-Host "3. Check if scp and ssh commands are available" -ForegroundColor Gray
    exit 1
}

