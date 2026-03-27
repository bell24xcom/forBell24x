#!/bin/bash
# FIX: Disk Space Full + Nginx Not Running
# Run this immediately!

set -e

echo "🔧 Fixing Disk Space + Nginx Issues..."
echo "======================================"

echo ""
echo "1️⃣ Checking Disk Space..."
echo "----------------------------------------"
df -h

echo ""
echo "2️⃣ Freeing Up Disk Space..."
echo "----------------------------------------"

# Remove stopped containers
echo "Removing stopped containers..."
docker container prune -f

# Remove unused images
echo "Removing unused images..."
docker image prune -a -f

# Remove unused volumes
echo "Removing unused volumes..."
docker volume prune -f

# Remove build cache
echo "Removing build cache..."
docker builder prune -f

# Clean up system packages
echo "Cleaning system packages..."
sudo apt-get clean
sudo apt-get autoremove -y

echo ""
echo "3️⃣ Checking Disk Space After Cleanup..."
echo "----------------------------------------"
df -h

echo ""
echo "4️⃣ Checking Current Container Status..."
echo "----------------------------------------"
docker ps | grep bell24h || echo "⚠️  Container not running"

echo ""
echo "5️⃣ Starting Nginx Service..."
echo "----------------------------------------"
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx --no-pager | head -5

echo ""
echo "6️⃣ Testing Nginx Configuration..."
echo "----------------------------------------"
sudo nginx -t

echo ""
echo "7️⃣ Reloading Nginx..."
echo "----------------------------------------"
sudo systemctl reload nginx

echo ""
echo "8️⃣ Testing Port 3000 (Container)..."
echo "----------------------------------------"
curl -I http://localhost:3000 | head -3 || echo "⚠️  Port 3000 not responding"

echo ""
echo "9️⃣ Testing Nginx Proxying..."
echo "----------------------------------------"
curl -I http://localhost | head -3 || echo "⚠️  Nginx not proxying"

echo ""
echo "🔟 Final Status..."
echo "----------------------------------------"
echo "Container Status:"
docker ps | grep bell24h || echo "❌ Container not running"

echo ""
echo "Nginx Status:"
sudo systemctl is-active nginx && echo "✅ Nginx is running" || echo "❌ Nginx not running"

echo ""
echo "Disk Space:"
df -h / | tail -1

echo ""
echo "======================================"
echo "✅ Fix Complete!"
echo "======================================"
echo ""
echo "🌐 Test your site in 2-3 minutes:"
echo "   - https://bell24h.com"
echo "   - https://bell24h.com/auth/demo-login"
echo ""

