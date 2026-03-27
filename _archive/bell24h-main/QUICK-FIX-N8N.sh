#!/bin/bash

echo "=========================================="
echo "🔧 QUICK FIX N8N 502 ERROR"
echo "=========================================="
echo ""

# Step 1: Restart n8n container
echo "1️⃣ RESTARTING N8N CONTAINER..."
if docker ps -a | grep -q n8n; then
    docker restart n8n
    echo "✅ N8N container restarted"
else
    echo "❌ N8N container not found - need to create it"
    echo "Run: docker run -d --name n8n --restart unless-stopped -p 5678:5678 -e N8N_HOST=n8n.bell24h.com -e N8N_PORT=5678 -e N8N_PROTOCOL=https -e WEBHOOK_URL=https://n8n.bell24h.com/ -v ~/.n8n:/home/node/.n8n n8nio/n8n:latest"
    exit 1
fi
echo ""

# Step 2: Wait for startup
echo "2️⃣ WAITING FOR N8N TO START (15 seconds)..."
sleep 15
echo ""

# Step 3: Check if running
echo "3️⃣ CHECKING CONTAINER STATUS..."
docker ps | grep n8n
echo ""

# Step 4: Check logs
echo "4️⃣ CHECKING LOGS..."
docker logs --tail=20 n8n
echo ""

# Step 5: Test local connection
echo "5️⃣ TESTING LOCAL CONNECTION..."
if curl -I http://localhost:5678 2>&1 | grep -q "200\|302"; then
    echo "✅ N8N is responding!"
else
    echo "❌ N8N is NOT responding - check logs above"
fi
echo ""

# Step 6: Restart Nginx
echo "6️⃣ RESTARTING NGINX..."
sudo systemctl restart nginx
sleep 2
sudo systemctl status nginx --no-pager | head -5
echo ""

# Step 7: Final test
echo "7️⃣ FINAL TEST..."
if curl -I http://localhost 2>&1 | grep -q "200"; then
    echo "✅ Nginx proxy is working!"
    echo "✅ Site should be live at https://n8n.bell24h.com"
else
    echo "❌ Nginx proxy test failed"
fi
echo ""

echo "=========================================="
echo "✅ FIX COMPLETE"
echo "=========================================="
echo ""

