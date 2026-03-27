#!/bin/bash

echo "=========================================="
echo "🔍 N8N 502 ERROR DIAGNOSTIC SCRIPT"
echo "=========================================="
echo ""

# Step 1: Check container status
echo "1️⃣ CHECKING N8N CONTAINER STATUS..."
echo "----------------------------------------"
docker ps -a | grep n8n || echo "❌ No n8n container found"
echo ""

# Step 2: Check port 5678
echo "2️⃣ CHECKING PORT 5678..."
echo "----------------------------------------"
if sudo lsof -i :5678 2>/dev/null; then
    echo "✅ Port 5678 is in use"
else
    echo "❌ Port 5678 is NOT in use (container may be stopped)"
fi
echo ""

# Step 3: Check logs
echo "3️⃣ CHECKING N8N LOGS (last 30 lines)..."
echo "----------------------------------------"
if docker ps -a | grep -q n8n; then
    docker logs --tail=30 n8n 2>&1
else
    echo "❌ Container doesn't exist - cannot check logs"
fi
echo ""

# Step 4: Test local connection
echo "4️⃣ TESTING LOCAL CONNECTION (port 5678)..."
echo "----------------------------------------"
if curl -I http://localhost:5678 2>&1 | head -5; then
    echo "✅ N8N is responding on port 5678"
else
    echo "❌ N8N is NOT responding on port 5678"
fi
echo ""

# Step 5: Check Nginx status
echo "5️⃣ CHECKING NGINX STATUS..."
echo "----------------------------------------"
sudo systemctl status nginx --no-pager | head -10
echo ""

# Step 6: Check Nginx n8n config
echo "6️⃣ CHECKING NGINX N8N CONFIG..."
echo "----------------------------------------"
if [ -f /etc/nginx/sites-available/n8n.bell24h.com ]; then
    echo "✅ Config file exists"
    sudo cat /etc/nginx/sites-available/n8n.bell24h.com | head -20
else
    echo "❌ Config file NOT FOUND: /etc/nginx/sites-available/n8n.bell24h.com"
    echo "Checking for other n8n configs..."
    sudo ls -la /etc/nginx/sites-available/ | grep n8n
fi
echo ""

# Step 7: Test Nginx config
echo "7️⃣ TESTING NGINX CONFIG..."
echo "----------------------------------------"
sudo nginx -t 2>&1
echo ""

# Step 8: Check disk space
echo "8️⃣ CHECKING DISK SPACE..."
echo "----------------------------------------"
df -h / | tail -1
echo ""

echo "=========================================="
echo "✅ DIAGNOSTIC COMPLETE"
echo "=========================================="
echo ""
echo "📋 NEXT STEPS:"
echo "1. If container stopped: docker start n8n"
echo "2. If container missing: Run n8n creation command"
echo "3. If port conflict: Kill process on 5678"
echo "4. If nginx error: Fix config and restart"
echo ""

