#!/bin/bash

# EMERGENCY 502 FIX SCRIPT for Bell24h Oracle VM
# Run this on the Oracle VM: ubuntu@80.225.192.248

set -e

echo "🔧 Starting Emergency 502 Fix..."
echo "=================================="

# Navigate to project directory
cd ~/bell24h || (mkdir -p ~/bell24h && cd ~/bell24h)

echo ""
echo "1️⃣ Checking Docker Container Status..."
echo "----------------------------------------"
docker ps -a | grep bell24h || echo "⚠️  Container not found"

echo ""
echo "2️⃣ Checking if .env.production exists..."
echo "----------------------------------------"
if [ -f client/.env.production ]; then
    echo "✅ .env.production exists"
    ls -lh client/.env.production
else
    echo "❌ .env.production NOT FOUND!"
    echo "Creating .env.production from template..."
    cat > client/.env.production << 'ENVEOF'
NODE_ENV=production
DATABASE_URL=your_database_url_here
NEXTAUTH_URL=https://bell24h.com
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXT_PUBLIC_APP_URL=https://bell24h.com
ENVEOF
    echo "⚠️  Please edit client/.env.production with real values!"
fi

echo ""
echo "3️⃣ Stopping Old Container..."
echo "----------------------------------------"
docker stop bell24h || true
docker rm bell24h || true

echo ""
echo "4️⃣ Pulling Latest Code..."
echo "----------------------------------------"
if [ -d .git ]; then
    git fetch origin main || true
    git reset --hard origin/main || true
else
    echo "⚠️  Not a git repo, cloning..."
    git clone https://github.com/digitex-erp/bell24h . || true
fi

echo ""
echo "5️⃣ Checking Nginx Status..."
echo "----------------------------------------"
sudo systemctl status nginx | head -5 || echo "⚠️  Nginx check failed"
sudo nginx -t || echo "⚠️  Nginx config has errors"

echo ""
echo "6️⃣ Building Docker Image..."
echo "----------------------------------------"
docker build -t bell24h:latest -f Dockerfile . || {
    echo "❌ Build failed! Checking logs..."
    exit 1
}

echo ""
echo "7️⃣ Starting New Container..."
echo "----------------------------------------"
docker run -d \
  --name bell24h \
  --restart always \
  -p 3000:3000 \
  --env-file client/.env.production \
  bell24h:latest || {
    echo "❌ Container start failed!"
    exit 1
}

echo ""
echo "8️⃣ Waiting for Container to Start..."
echo "----------------------------------------"
sleep 15

echo ""
echo "9️⃣ Checking Container Status..."
echo "----------------------------------------"
docker ps | grep bell24h || echo "❌ Container not running!"
docker logs --tail 20 bell24h

echo ""
echo "🔟 Testing Health Endpoint..."
echo "----------------------------------------"
curl -f http://localhost:3000/api/health > /dev/null 2>&1 && echo "✅ Health check passed!" || echo "❌ Health check failed!"

echo ""
echo "1️⃣1️⃣ Verifying Nginx Proxying..."
echo "----------------------------------------"
sudo nginx -t && sudo systemctl reload nginx || echo "⚠️  Nginx reload failed"

echo ""
echo "1️⃣2️⃣ Final Status Check..."
echo "----------------------------------------"
echo "Container Status:"
docker ps | grep bell24h || echo "❌ Container not running"
echo ""
echo "Port 3000 Check:"
curl -f http://localhost:3000 > /dev/null 2>&1 && echo "✅ Port 3000 responding" || echo "❌ Port 3000 not responding"
echo ""
echo "Nginx Status:"
sudo systemctl status nginx --no-pager | head -3 || true

echo ""
echo "=================================="
echo "✅ Emergency Fix Complete!"
echo "=================================="
echo ""
echo "📋 Next Steps:"
echo "1. Check container logs: docker logs -f bell24h"
echo "2. Verify .env.production has correct values"
echo "3. Test site: curl -I http://localhost:3000"
echo "4. Check Nginx: sudo nginx -t && sudo systemctl status nginx"
echo ""

