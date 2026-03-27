#!/bin/bash

echo "=========================================="
echo "🔍 BELL24H 502 ERROR DIAGNOSTIC SCRIPT"
echo "=========================================="
echo ""

# Step 1: Check Docker container status
echo "1️⃣ CHECKING CONTAINER STATUS..."
echo "----------------------------------------"
docker ps -a | grep bell24h || echo "❌ No bell24h container found"
echo ""

# Step 2: Check container logs
echo "2️⃣ CHECKING CONTAINER LOGS (last 50 lines)..."
echo "----------------------------------------"
if docker ps -a | grep -q bell24h; then
    docker logs --tail=50 bell24h 2>&1
else
    echo "❌ Container doesn't exist - cannot check logs"
fi
echo ""

# Step 3: Check if port 3000 is in use
echo "3️⃣ CHECKING PORT 3000..."
echo "----------------------------------------"
if sudo lsof -i :3000 2>/dev/null; then
    echo "✅ Port 3000 is in use"
else
    echo "❌ Port 3000 is NOT in use (container may be stopped)"
fi
echo ""

# Step 4: Check Nginx status
echo "4️⃣ CHECKING NGINX STATUS..."
echo "----------------------------------------"
sudo systemctl status nginx --no-pager | head -10
echo ""

# Step 5: Test localhost:3000
echo "5️⃣ TESTING LOCALHOST:3000..."
echo "----------------------------------------"
if curl -I http://localhost:3000 2>&1 | head -5; then
    echo "✅ Container is responding on port 3000"
else
    echo "❌ Container is NOT responding on port 3000"
fi
echo ""

# Step 6: Check disk space
echo "6️⃣ CHECKING DISK SPACE..."
echo "----------------------------------------"
df -h / | tail -1
echo ""

# Step 7: Check recent Docker images
echo "7️⃣ RECENT DOCKER IMAGES..."
echo "----------------------------------------"
docker images | head -5
echo ""

# Step 8: Check .env.production exists
echo "8️⃣ CHECKING .env.production..."
echo "----------------------------------------"
if [ -f ~/bell24h/client/.env.production ]; then
    echo "✅ .env.production exists"
    echo "File size: $(wc -l < ~/bell24h/client/.env.production) lines"
else
    echo "❌ .env.production NOT FOUND"
fi
echo ""

echo "=========================================="
echo "✅ DIAGNOSTIC COMPLETE"
echo "=========================================="
echo ""
echo "📋 NEXT STEPS:"
echo "1. Review the logs above for errors"
echo "2. If container is stopped, restart it (see FIX-502-ERROR.sh)"
echo "3. If container is running but not responding, check logs for crashes"
echo ""

