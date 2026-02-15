Write-Host "Starting deployment process..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "Error: package.json not found. Please run from client directory." -ForegroundColor Red
    exit 1
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate

Write-Host "Building application..." -ForegroundColor Yellow
npm run build

Write-Host "Deploying to Vercel..." -ForegroundColor Yellow
vercel --prod --yes

Write-Host "Deployment complete!" -ForegroundColor Green
