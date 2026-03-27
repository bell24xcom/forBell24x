#!/bin/bash
# Fix Cloudflare Error 521 - Web Server Is Down
# This means Cloudflare can't reach your Oracle VM

set -e

echo "🔧 Fixing Error 521 - Cloudflare Connection Issue"
echo "=================================================="
echo ""

# Step 1: Check container status
echo "STEP 1: Checking container status..."
if docker ps | grep -q bell24h; then
    echo "✅ Container is running"
    docker ps --filter "name=bell24h" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "❌ Container is NOT running!"
    echo "Starting container..."
    cd ~/bell24h
    docker run -d \
      --name bell24h \
      --restart always \
      -p 80:3000 \
      --env-file ~/bell24h/client/.env.production \
      bell24h:latest
    sleep 10
    echo "✅ Container started"
fi
echo ""

# Step 2: Test local connection
echo "STEP 2: Testing local connection..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Local connection works"
    curl -s http://localhost/api/health | head -1
else
    echo "❌ Local connection failed!"
    echo "Container logs:"
    docker logs --tail 20 bell24h
    exit 1
fi
echo ""

# Step 3: Test external IP
echo "STEP 3: Testing external IP (80.225.192.248)..."
if curl -f -m 5 http://80.225.192.248/api/health > /dev/null 2>&1; then
    echo "✅ External IP accessible"
    curl -s -m 5 http://80.225.192.248/api/health | head -1
else
    echo "⚠️  External IP test failed (may be firewall)"
    echo "This is OK if Cloudflare proxy is ON"
fi
echo ""

# Step 4: Check port 80 is listening
echo "STEP 4: Checking port 80..."
if sudo ss -ltnp | grep -q ':80 '; then
    LISTENER=$(sudo ss -ltnp | grep ':80 ' | awk '{print $6}')
    echo "✅ Port 80 is listening"
    echo "   Process: $LISTENER"
    if echo "$LISTENER" | grep -q docker; then
        echo "✅ Docker is handling port 80 correctly"
    else
        echo "⚠️  Something else is using port 80: $LISTENER"
    fi
else
    echo "❌ Port 80 is NOT listening!"
    echo "Container may not be running properly"
    docker logs --tail 30 bell24h
    exit 1
fi
echo ""

# Step 5: Check firewall
echo "STEP 5: Checking firewall..."
if sudo ufw status | grep -q "Status: active"; then
    echo "⚠️  Firewall is active"
    if sudo ufw status | grep -q "80/tcp"; then
        echo "✅ Port 80 is allowed in firewall"
    else
        echo "❌ Port 80 may be blocked!"
        echo "Opening port 80..."
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        echo "✅ Ports opened"
    fi
else
    echo "✅ Firewall is inactive (or using Oracle Cloud firewall)"
fi
echo ""

# Step 6: Test from outside (if possible)
echo "STEP 6: Testing external connectivity..."
echo "Testing if port 80 is reachable from outside..."
echo "(This may fail if Oracle Cloud firewall blocks it - that's OK)"
curl -f -m 5 http://80.225.192.248/api/health 2>&1 || echo "External test failed (may need Oracle Cloud firewall rule)"
echo ""

# Step 7: Cloudflare proxy check
echo "=================================================="
echo "CLOUDFLARE SETTINGS CHECK:"
echo "=================================================="
echo ""
echo "⚠️  IMPORTANT: Error 521 usually means:"
echo "   1. Cloudflare proxy is ON but can't reach your server"
echo "   2. OR Oracle Cloud firewall is blocking Cloudflare IPs"
echo ""
echo "SOLUTION OPTIONS:"
echo ""
echo "OPTION A: Turn OFF Cloudflare Proxy (DNS Only)"
echo "  1. Go to Cloudflare Dashboard"
echo "  2. DNS tab → Find A records"
echo "  3. Click gray cloud icon → Turn OFF proxy (gray cloud)"
echo "  4. Wait 2 minutes"
echo "  5. Test: https://bell24h.com"
echo ""
echo "OPTION B: Add Oracle Cloud Firewall Rule"
echo "  1. Go to Oracle Cloud Console"
echo "  2. Networking → Security Lists"
echo "  3. Add rule: Allow TCP port 80 from 0.0.0.0/0"
echo "  4. Add rule: Allow TCP port 443 from 0.0.0.0/0"
echo ""
echo "OPTION C: Use Cloudflare Tunnel (Advanced)"
echo "  (Not recommended for non-coders)"
echo ""

# Step 8: Final status
echo "=================================================="
echo "CURRENT STATUS:"
echo "=================================================="
echo ""
echo "Container:"
docker ps --filter "name=bell24h" --format "  {{.Names}}: {{.Status}}"
echo ""
echo "Local Health:"
curl -s http://localhost/api/health | head -1
echo ""
echo "Port 80:"
sudo ss -ltnp | grep ':80 ' || echo "  Not listening (ERROR!)"
echo ""
echo "Next Steps:"
echo "  1. If container is running → Check Cloudflare proxy settings"
echo "  2. If container stopped → Check logs: docker logs bell24h"
echo "  3. If port 80 blocked → Add Oracle Cloud firewall rule"
echo ""

