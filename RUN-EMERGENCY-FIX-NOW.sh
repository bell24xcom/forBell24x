#!/bin/bash
# Copy-paste these commands into your Oracle VM SSH session

echo "🚀 Starting Emergency 502 Fix on Oracle VM..."
echo "=============================================="

# Navigate to project directory
cd ~/bell24h || (mkdir -p ~/bell24h && cd ~/bell24h)

echo ""
echo "1️⃣ Stopping old container..."
docker stop bell24h 2>/dev/null || true
docker rm bell24h 2>/dev/null || true

echo ""
echo "2️⃣ Pulling latest code..."
if [ -d .git ]; then
    git fetch origin main
    git reset --hard origin/main
else
    git clone https://github.com/digitex-erp/bell24h . || true
fi

echo ""
echo "3️⃣ Checking .env.production..."
if [ ! -f client/.env.production ]; then
    echo "⚠️  .env.production NOT FOUND! Creating template..."
    cat > client/.env.production << 'ENVEOF'
NODE_ENV=production
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_db
NEXTAUTH_URL=https://bell24h.com
NEXTAUTH_SECRET=please-change-this-to-random-secret
NEXT_PUBLIC_APP_URL=https://bell24h.com
ENVEOF
    echo "⚠️  Please edit client/.env.production with real values!"
    echo "Press Enter after editing, or Ctrl+C to cancel..."
    read
fi

echo ""
echo "4️⃣ Building Docker image..."
docker build -t bell24h:latest -f Dockerfile . || {
    echo "❌ Build failed! Check errors above."
    exit 1
}

echo ""
echo "5️⃣ Starting container..."
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
echo "6️⃣ Waiting for container to start (15 seconds)..."
sleep 15

echo ""
echo "7️⃣ Checking container status..."
docker ps | grep bell24h || echo "❌ Container not running!"

echo ""
echo "8️⃣ Container logs (last 30 lines):"
docker logs --tail 30 bell24h

echo ""
echo "9️⃣ Testing health endpoint..."
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check PASSED!"
else
    echo "❌ Health check FAILED - container may still be starting"
fi

echo ""
echo "🔟 Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx || echo "⚠️  Nginx reload skipped"

echo ""
echo "=============================================="
echo "✅ Emergency Fix Complete!"
echo "=============================================="
echo ""
echo "📋 Verification:"
echo "1. Container: $(docker ps | grep bell24h | wc -l) container(s) running"
echo "2. Port 3000: Testing..."
curl -I http://localhost:3000 2>&1 | head -1 || echo "⚠️  Port 3000 not responding yet"
echo ""
echo "🌐 Test your site in 2-3 minutes:"
echo "   - https://bell24h.com"
echo "   - https://bell24h.com/auth/demo-login"
echo ""
echo "📊 If still 502, check logs:"
echo "   docker logs -f bell24h"
echo ""

