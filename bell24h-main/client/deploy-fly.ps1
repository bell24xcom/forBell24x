# Fly.io Deployment Script for bell24h
# Run this script to automatically deploy to Fly.io Mumbai region

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BELL24h - Fly.io Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Fly CLI is installed
Write-Host "Step 1: Checking Fly.io CLI installation..." -ForegroundColor Yellow
try {
    $flyVersion = fly version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Fly.io CLI is installed: $flyVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Fly.io CLI not found. Installing..." -ForegroundColor Red
        Write-Host "Please run this command manually as Administrator:" -ForegroundColor Yellow
        Write-Host "  iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor White
        Write-Host ""
        Write-Host "After installation, close and reopen PowerShell, then run this script again." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Fly.io CLI not found. Please install it first." -ForegroundColor Red
    Write-Host "Run as Administrator: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Check if logged in
Write-Host "Step 2: Checking Fly.io authentication..." -ForegroundColor Yellow
try {
    fly auth whoami 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Already logged in to Fly.io" -ForegroundColor Green
    } else {
        Write-Host "✗ Not logged in. Please run: fly auth login" -ForegroundColor Red
        Write-Host "This will open a browser for you to sign in." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "✗ Not logged in. Please run: fly auth login" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Check if app exists
Write-Host "Step 3: Checking if app 'bell24h' exists..." -ForegroundColor Yellow
try {
    fly apps list 2>&1 | Select-String "bell24h" | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ App 'bell24h' already exists" -ForegroundColor Green
    } else {
        Write-Host "App doesn't exist. Will create during launch..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "App doesn't exist. Will create during launch..." -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Check for environment variables
Write-Host "Step 4: Checking environment variables..." -ForegroundColor Yellow
Write-Host "Current secrets in Fly.io:" -ForegroundColor Cyan
fly secrets list 2>&1

Write-Host ""
Write-Host "IMPORTANT: Make sure these secrets are set:" -ForegroundColor Yellow
Write-Host "  - DATABASE_URL (your Neon PostgreSQL connection string)" -ForegroundColor White
Write-Host "  - NEXT_PUBLIC_APP_URL (https://bell24h.fly.dev)" -ForegroundColor White
Write-Host "  - MSG91_API_KEY (if using MSG91)" -ForegroundColor White
Write-Host "  - MSG91_SENDER_ID (if using MSG91)" -ForegroundColor White
Write-Host ""
$continue = Read-Host "Have you set all required secrets? (y/n)"
if ($continue -ne 'y' -and $continue -ne 'Y') {
    Write-Host ""
    Write-Host "To set secrets, run:" -ForegroundColor Yellow
    Write-Host "  fly secrets set DATABASE_URL='your-neon-url'" -ForegroundColor White
    Write-Host "  fly secrets set NEXT_PUBLIC_APP_URL='https://bell24h.fly.dev'" -ForegroundColor White
    Write-Host ""
    Write-Host "After setting secrets, run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 5: Launch app (if not already launched)
Write-Host "Step 5: Launching app in Mumbai region..." -ForegroundColor Yellow
Write-Host "This will create the app if it doesn't exist." -ForegroundColor Cyan
Write-Host ""

# Check if fly.toml exists
if (Test-Path "fly.toml") {
    Write-Host "✓ fly.toml found" -ForegroundColor Green
} else {
    Write-Host "✗ fly.toml not found. Creating..." -ForegroundColor Red
    Write-Host "Please ensure fly.toml exists in the client directory." -ForegroundColor Yellow
    exit 1
}

# Launch app (non-interactive, will use existing config if app exists)
Write-Host "Running: fly launch --name bell24h --region bom --no-deploy" -ForegroundColor Cyan
Write-Host "If prompted, answer:" -ForegroundColor Yellow
Write-Host "  - Copy config? N" -ForegroundColor White
Write-Host "  - Setup PostgreSQL? N" -ForegroundColor White
Write-Host "  - Deploy now? N" -ForegroundColor White
Write-Host ""

fly launch --name bell24h --region bom --no-deploy

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Launch failed. Please check the error above." -ForegroundColor Red
    exit 1
}

Write-Host "✓ App launched successfully" -ForegroundColor Green
Write-Host ""

# Step 6: Deploy
Write-Host "Step 6: Deploying to Fly.io..." -ForegroundColor Yellow
Write-Host "This will take 3-5 minutes..." -ForegroundColor Cyan
Write-Host ""

fly deploy

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✓ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app is live at:" -ForegroundColor Cyan
    Write-Host "  https://bell24h.fly.dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Update DNS in Cloudflare:" -ForegroundColor White
    Write-Host "     - Delete: CNAME @ → bell24h.pages.dev" -ForegroundColor White
    Write-Host "     - Add: CNAME @ → bell24h.fly.dev (Proxy: ON)" -ForegroundColor White
    Write-Host "  2. Wait 2-5 minutes for DNS propagation" -ForegroundColor White
    Write-Host "  3. Visit: https://bell24h.com" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "✗ Deployment failed. Check the error above." -ForegroundColor Red
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Missing environment variables (run: fly secrets list)" -ForegroundColor White
    Write-Host "  - Build errors (check logs above)" -ForegroundColor White
    Write-Host "  - Network issues" -ForegroundColor White
    exit 1
}

