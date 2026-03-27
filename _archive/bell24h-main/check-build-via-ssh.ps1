# PowerShell script to check Docker build on Oracle VM via SSH
# Usage: .\check-build-via-ssh.ps1

# Replace with your Oracle VM IP address
$VM_IP = "YOUR_ORACLE_VM_IP"
$VM_USER = "ubuntu"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "🔍 CHECKING DOCKER BUILD ON ORACLE VM" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if SSH is available
if (Get-Command ssh -ErrorAction SilentlyContinue) {
    Write-Host "✅ SSH found" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Checking Docker build process..." -ForegroundColor Yellow
    ssh ${VM_USER}@${VM_IP} "ps aux | grep 'docker build' | grep -v grep"
    
    Write-Host ""
    Write-Host "Checking Docker daemon status..." -ForegroundColor Yellow
    ssh ${VM_USER}@${VM_IP} "sudo systemctl status docker --no-pager | head -15"
    
    Write-Host ""
    Write-Host "Checking Docker containers..." -ForegroundColor Yellow
    ssh ${VM_USER}@${VM_IP} "docker ps -a"
    
    Write-Host ""
    Write-Host "Checking system resources..." -ForegroundColor Yellow
    ssh ${VM_USER}@${VM_IP} "top -bn1 | head -20"
    
} else {
    Write-Host "❌ SSH not found. Please install OpenSSH:" -ForegroundColor Red
    Write-Host "   Windows: Settings > Apps > Optional Features > OpenSSH Client" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or use PuTTY/WSL to connect manually:" -ForegroundColor Yellow
    Write-Host "   ssh ubuntu@$VM_IP" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

