# ============================================
# BELL24H SSH KEY SETUP (One-time)
# After this, no password needed!
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  BELL24H SSH KEY SETUP"
Write-Host "  One-time configuration"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVER_IP = "165.232.187.195"
$SERVER_USER = "root"
$SSH_DIR = "$env:USERPROFILE\.ssh"
$KEY_FILE = Join-Path $SSH_DIR "bell24h_rsa"

# Step 1: Check if SSH directory exists
Write-Host "[1/5] Checking SSH configuration..." -ForegroundColor Yellow

if (-not (Test-Path $SSH_DIR)) {
    Write-Host "Creating SSH directory..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $SSH_DIR -Force | Out-Null
}

# Step 2: Generate SSH key if it doesn't exist
Write-Host ""
Write-Host "[2/5] Generating SSH key pair..." -ForegroundColor Yellow

if (Test-Path $KEY_FILE) {
    Write-Host "✓ SSH key already exists" -ForegroundColor Green
} else {
    ssh-keygen -t rsa -b 4096 -f $KEY_FILE -N '""' -C "bell24h-deploy"
    Write-Host "✓ SSH key generated" -ForegroundColor Green
}

# Step 3: Copy public key to server
Write-Host ""
Write-Host "[3/5] Installing SSH key on server..." -ForegroundColor Yellow
Write-Host "You'll need to enter server password ONE LAST TIME: Bell@2026" -ForegroundColor Yellow

$publicKey = Get-Content (Join-Path $SSH_DIR "bell24h_rsa.pub")

# Create authorized_keys on server
$sshCommand = @"
mkdir -p ~/.ssh && \
chmod 700 ~/.ssh && \
echo '$publicKey' >> ~/.ssh/authorized_keys && \
chmod 600 ~/.ssh/authorized_keys && \
echo 'SSH key installed successfully'
"@

ssh "$SERVER_USER@$SERVER_IP" $sshCommand

Write-Host "✓ SSH key installed on server" -ForegroundColor Green

# Step 4: Create SSH config
Write-Host ""
Write-Host "[4/5] Creating SSH config..." -ForegroundColor Yellow

$sshConfig = @"
Host bell24h
    HostName $SERVER_IP
    User $SERVER_USER
    IdentityFile $KEY_FILE
    StrictHostKeyChecking no
"@

$configFile = Join-Path $SSH_DIR "config"
if (Test-Path $configFile) {
    $existingConfig = Get-Content $configFile -Raw
    if ($existingConfig -notmatch "Host bell24h") {
        Add-Content $configFile "`n$sshConfig"
    }
} else {
    Set-Content $configFile $sshConfig
}

Write-Host "✓ SSH config created" -ForegroundColor Green

# Step 5: Test connection
Write-Host ""
Write-Host "[5/5] Testing passwordless SSH connection..." -ForegroundColor Yellow

ssh bell24h "echo 'Connection successful!'"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SSH SETUP COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✓ You can now use 'ssh bell24h' without password" -ForegroundColor Cyan
    Write-Host "✓ Auto-deploy script will work seamlessly" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next: Run deploy-ssh.ps1 to deploy your changes!" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "⚠ WARNING: SSH connection failed" -ForegroundColor Red
    Write-Host "Please check your server configuration" -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")