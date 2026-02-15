#!/bin/bash
# IMMEDIATE 502 FIX - Copy-paste this ENTIRE script

set -e

echo "🚀 Fixing 502 Error - Step by Step"
echo "=================================="
echo ""

# Step 1: Stop nginx (it's blocking port 80)
echo "STEP 1: Stopping nginx..."
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl disable nginx 2>/dev/null || true
echo "✅ nginx stopped"
echo ""

# Step 2: Check if container exists
echo "STEP 2: Checking container..."
cd ~/bell24h

if docker ps -a | grep -q bell24h; then
    echo "Container exists - removing old one..."
    docker stop bell24h 2>/dev/null || true
    docker rm bell24h 2>/dev/null || true
    echo "✅ Old container removed"
else
    echo "No container found - will create new one"
fi
echo ""

# Step 3: Check .env.production
echo "STEP 3: Checking environment file..."
if [ ! -f "client/.env.production" ]; then
    echo "Creating .env.production..."
    SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    mkdir -p client
    cat > client/.env.production << EOF
DATABASE_URL=postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://bell24h.com
NEXTAUTH_SECRET=$SECRET
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bell24h.com
EOF
    echo "✅ .env.production created"
else
    echo "✅ .env.production exists"
fi
echo ""

# Step 4: Check if Docker image exists
echo "STEP 4: Checking Docker image..."
if docker images | grep -q "bell24h.*latest"; then
    echo "✅ Docker image exists"
else
    echo "❌ Docker image not found!"
    echo "Building image (this takes 5-10 minutes)..."
    docker build --no-cache -t bell24h:latest -f Dockerfile . || {
        echo "Build failed - trying without --no-cache..."
        docker build -t bell24h:latest -f Dockerfile .
    }
    echo "✅ Image built"
fi
echo ""

# Step 5: Start container
echo "STEP 5: Starting container..."
docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest

echo "✅ Container started"
echo ""

# Step 6: Wait and check
echo "STEP 6: Waiting for container to start (30 seconds)..."
sleep 10

if ! docker ps | grep -q bell24h; then
    echo "❌ Container stopped! Checking logs..."
    docker logs bell24h 2>&1 | tail -30
    exit 1
fi

echo "✅ Container is running"
sleep 20
echo ""

# Step 7: Test health
echo "STEP 7: Testing health endpoint..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Health check: PASSED"
    curl http://localhost/api/health
    echo ""
else
    echo "⚠️  Health check failed - checking logs..."
    docker logs bell24h 2>&1 | tail -20
    echo ""
    echo "Container is running but may need more time..."
fi
echo ""

# Step 8: Final status
echo "=================================="
echo "FINAL STATUS:"
echo "=================================="
docker ps --filter "name=bell24h" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Test URLs:"
echo "  - http://80.225.192.248/api/health"
echo "  - https://bell24h.com/api/health"
echo ""
echo "If you still see 502:"
echo "  1. Wait 2-3 minutes for DNS/CDN cache to clear"
echo "  2. Check Cloudflare: SSL/TLS → Full mode"
echo "  3. Verify A records point to 80.225.192.248"
echo ""

