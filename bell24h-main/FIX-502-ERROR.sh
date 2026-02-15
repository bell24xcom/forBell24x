#!/bin/bash

echo "=========================================="
echo "🔧 BELL24H 502 ERROR FIX SCRIPT"
echo "=========================================="
echo ""

# Step 1: Stop and remove old container
echo "1️⃣ STOPPING OLD CONTAINER..."
docker stop bell24h 2>/dev/null || echo "Container not running"
docker rm bell24h 2>/dev/null || echo "Container not found"
echo "✅ Old container removed"
echo ""

# Step 2: Check if .env.production exists
echo "2️⃣ CHECKING ENVIRONMENT FILE..."
if [ ! -f ~/bell24h/client/.env.production ]; then
    echo "❌ ERROR: .env.production not found!"
    echo "Location: ~/bell24h/client/.env.production"
    echo "Please create this file before continuing."
    exit 1
fi
echo "✅ .env.production found"
echo ""

# Step 3: Pull latest code (optional - comment out if you want to use current code)
echo "3️⃣ PULLING LATEST CODE..."
cd ~/bell24h
git pull origin main || echo "⚠️ Git pull failed - using existing code"
echo ""

# Step 4: Rebuild Docker image
echo "4️⃣ REBUILDING DOCKER IMAGE..."
cd ~/bell24h/client
docker build -t bell24h:latest . || {
    echo "❌ Docker build failed!"
    echo "Check the error messages above."
    exit 1
}
echo "✅ Docker image built successfully"
echo ""

# Step 5: Start new container
echo "5️⃣ STARTING NEW CONTAINER..."
docker run -d \
  --name bell24h \
  --restart always \
  -p 3000:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest || {
    echo "❌ Failed to start container!"
    exit 1
}
echo "✅ Container started"
echo ""

# Step 6: Wait for app to start
echo "6️⃣ WAITING FOR APP TO START (15 seconds)..."
sleep 15
echo ""

# Step 7: Check container logs
echo "7️⃣ CHECKING CONTAINER LOGS..."
docker logs --tail=30 bell24h
echo ""

# Step 8: Test container
echo "8️⃣ TESTING CONTAINER..."
if curl -I http://localhost:3000 2>&1 | grep -q "200 OK"; then
    echo "✅ Container is responding on port 3000"
else
    echo "❌ Container is NOT responding - check logs above"
    echo "Run: docker logs --tail=100 bell24h"
    exit 1
fi
echo ""

# Step 9: Restart Nginx
echo "9️⃣ RESTARTING NGINX..."
sudo systemctl restart nginx
sleep 2
sudo systemctl status nginx --no-pager | head -5
echo ""

# Step 10: Final test
echo "🔟 FINAL TEST..."
if curl -I http://localhost 2>&1 | grep -q "200 OK"; then
    echo "✅ Nginx is proxying correctly!"
    echo "✅ Site should be live at https://bell24h.com"
else
    echo "❌ Nginx proxy test failed"
    echo "Check Nginx config: sudo nginx -t"
fi
echo ""

echo "=========================================="
echo "✅ FIX COMPLETE"
echo "=========================================="
echo ""
echo "🌐 Test your site: https://bell24h.com"
echo ""

