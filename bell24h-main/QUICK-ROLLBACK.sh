#!/bin/bash

echo "=========================================="
echo "⏪ QUICK ROLLBACK TO PREVIOUS IMAGE"
echo "=========================================="
echo ""

# List recent images
echo "📋 RECENT DOCKER IMAGES:"
echo "----------------------------------------"
docker images bell24h --format "table {{.ID}}\t{{.CreatedAt}}\t{{.Size}}" | head -5
echo ""

# Get the second most recent image (previous working version)
echo "🔍 Finding previous working image..."
PREVIOUS_IMAGE=$(docker images bell24h --format "{{.ID}}" | sed -n '2p')

if [ -z "$PREVIOUS_IMAGE" ]; then
    echo "❌ No previous image found!"
    echo "You'll need to rebuild from scratch."
    exit 1
fi

echo "✅ Found previous image: $PREVIOUS_IMAGE"
echo ""

# Stop and remove current container
echo "1️⃣ STOPPING CURRENT CONTAINER..."
docker stop bell24h 2>/dev/null || true
docker rm bell24h 2>/dev/null || true
echo "✅ Old container removed"
echo ""

# Start with previous image
echo "2️⃣ STARTING WITH PREVIOUS IMAGE..."
docker run -d \
  --name bell24h \
  --restart always \
  -p 3000:3000 \
  --env-file ~/bell24h/client/.env.production \
  $PREVIOUS_IMAGE || {
    echo "❌ Failed to start container with previous image"
    exit 1
}
echo "✅ Container started with previous image"
echo ""

# Wait and test
echo "3️⃣ WAITING FOR APP TO START..."
sleep 10

echo "4️⃣ TESTING..."
if curl -I http://localhost:3000 2>&1 | grep -q "200 OK"; then
    echo "✅ Previous image is working!"
    echo "✅ Site should be live"
else
    echo "❌ Previous image also not working"
    echo "Check logs: docker logs bell24h"
fi
echo ""

# Restart Nginx
echo "5️⃣ RESTARTING NGINX..."
sudo systemctl restart nginx
echo "✅ Nginx restarted"
echo ""

echo "=========================================="
echo "✅ ROLLBACK COMPLETE"
echo "=========================================="
echo ""

