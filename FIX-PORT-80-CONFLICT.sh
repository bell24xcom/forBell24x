#!/bin/bash
# FIX: Port 80 conflict + Container not running
# Run this to fix Nginx port binding issues

set -e

echo "🔧 Fixing Port 80 Conflict + Restarting Container..."
echo "===================================================="

echo ""
echo "1️⃣ Finding what's using port 80..."
echo "----------------------------------------"
sudo lsof -i :80 || echo "No process found (may need different command)"
sudo netstat -tlnp | grep :80 || echo "No process found"
sudo ss -tlnp | grep :80 || echo "No process found"

echo ""
echo "2️⃣ Finding what's using port 443..."
echo "----------------------------------------"
sudo lsof -i :443 || echo "No process found"
sudo ss -tlnp | grep :443 || echo "No process found"

echo ""
echo "3️⃣ Checking all Docker containers..."
echo "----------------------------------------"
docker ps -a

echo ""
echo "4️⃣ Stopping ALL containers using ports 80/443..."
echo "----------------------------------------"
# Find and stop containers using port 80 or 443
docker ps --format "table {{.ID}}\t{{.Ports}}" | grep -E ":80|:443" | awk '{print $1}' | while read id; do
    if [ ! -z "$id" ]; then
        echo "Stopping container: $id"
        docker stop $id || true
    fi
done

# Also check for processes
sudo fuser -k 80/tcp 2>/dev/null || true
sudo fuser -k 443/tcp 2>/dev/null || true

echo ""
echo "5️⃣ Checking container status..."
echo "----------------------------------------"
docker ps -a | grep bell24h || echo "⚠️  bell24h container not found"

echo ""
echo "6️⃣ Starting/Restarting bell24h container..."
echo "----------------------------------------"
# Check if container exists
if docker ps -a | grep -q bell24h; then
    echo "Container exists, starting it..."
    docker start bell24h 2>/dev/null || docker restart bell24h 2>/dev/null || {
        echo "⚠️  Could not start existing container, checking logs..."
        docker logs --tail 20 bell24h || true
    }
else
    echo "⚠️  Container not found! You may need to rebuild."
    echo "Run: docker build -t bell24h:latest -f Dockerfile . && docker run -d --name bell24h --restart always -p 3000:3000 --env-file client/.env.production bell24h:latest"
fi

echo ""
echo "7️⃣ Waiting for container to start..."
echo "----------------------------------------"
sleep 10

echo ""
echo "8️⃣ Verifying container is running..."
echo "----------------------------------------"
docker ps | grep bell24h || echo "❌ Container not running"

echo ""
echo "9️⃣ Testing port 3000..."
echo "----------------------------------------"
curl -I http://localhost:3000 2>/dev/null | head -3 || echo "⚠️  Port 3000 not responding yet (may need more time)"

echo ""
echo "🔟 Checking if port 80 is free now..."
echo "----------------------------------------"
sudo ss -tlnp | grep :80 || echo "✅ Port 80 is free!"

echo ""
echo "1️⃣1️⃣ Starting Nginx..."
echo "----------------------------------------"
sudo systemctl start nginx 2>&1 || {
    echo "⚠️  Nginx start failed, checking error..."
    sudo journalctl -u nginx --no-pager -n 10
}

echo ""
echo "1️⃣2️⃣ Verifying Nginx status..."
echo "----------------------------------------"
sudo systemctl status nginx --no-pager | head -5 || echo "⚠️  Could not get Nginx status"

echo ""
echo "1️⃣3️⃣ Testing Nginx..."
echo "----------------------------------------"
curl -I http://localhost 2>/dev/null | head -5 || echo "⚠️  Nginx not responding"

echo ""
echo "===================================================="
echo "✅ Fix Complete!"
echo "===================================================="
echo ""
echo "📋 Final Status:"
echo "   Container: $(docker ps | grep bell24h | wc -l) running"
echo "   Nginx: $(sudo systemctl is-active nginx 2>/dev/null || echo 'not active')"
echo "   Port 80: $(sudo ss -tlnp | grep :80 | wc -l) process(es)"
echo "   Port 3000: $(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 2>/dev/null || echo 'not responding')"
echo ""
echo "🌐 Test in 2-3 minutes:"
echo "   - https://bell24h.com"
echo "   - https://bell24h.com/auth/demo-login"
echo ""

