#!/bin/bash
# BELL24h Automated 502 Fix & Deployment Script
# For Non-Coders - Just run this script and it fixes everything

set -e  # Stop on any error

echo "🚀 BELL24h Automated Deployment Fix Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Check current status
echo -e "${YELLOW}STEP 1: Checking current status...${NC}"
echo ""

# Check if container exists
if docker ps -a | grep -q bell24h; then
    echo "✅ Container exists"
    CONTAINER_STATUS=$(docker ps -a --filter "name=bell24h" --format "{{.Status}}")
    echo "   Status: $CONTAINER_STATUS"
else
    echo "❌ Container not found - will create new one"
fi

# Check if container is running
if docker ps | grep -q bell24h; then
    echo "✅ Container is running"
    RUNNING=true
else
    echo "❌ Container is NOT running (this is why you see 502 error)"
    RUNNING=false
fi

echo ""

# Step 2: Stop and remove existing container
echo -e "${YELLOW}STEP 2: Cleaning up existing container...${NC}"
docker stop bell24h 2>/dev/null || true
docker rm bell24h 2>/dev/null || true
echo "✅ Cleanup complete"
echo ""

# Step 3: Verify project directory and files
echo -e "${YELLOW}STEP 3: Verifying project files...${NC}"
cd ~/bell24h || { echo "❌ Cannot find ~/bell24h directory"; exit 1; }

if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found - creating it..."
    cat > Dockerfile << 'DOCKERFILE_END'
FROM node:20-bullseye-slim AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY client/package*.json ./
ENV NPM_CONFIG_FUND=false NPM_CONFIG_AUDIT=false npm_config_ignore_scripts=true
RUN npm ci --no-audit --no-fund --legacy-peer-deps

FROM node:20-bullseye-slim AS builder
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 NODE_OPTIONS=--max_old_space_size=2048
COPY --from=deps /app/node_modules ./node_modules
COPY client/ ./
COPY client/prisma ./prisma/
RUN npx prisma generate || true
RUN npm run build
RUN npm prune --omit=dev --legacy-peer-deps || npm prune --omit=dev --force || true

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000 NEXT_TELEMETRY_DISABLED=1
RUN useradd -m appuser
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3000
USER appuser
CMD ["npm", "run", "start"]
DOCKERFILE_END
    echo "✅ Dockerfile created"
fi

if [ ! -f "client/.env.production" ]; then
    echo "❌ .env.production not found - creating it..."
    SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)
    mkdir -p client
    cat > client/.env.production << EOF
# Database
DATABASE_URL=postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Next Auth
NEXTAUTH_URL=https://bell24h.com
NEXTAUTH_SECRET=$SECRET

# Node Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bell24h.com
EOF
    echo "✅ .env.production created"
else
    echo "✅ .env.production exists"
fi

echo ""

# Step 4: Check port 80 availability
echo -e "${YELLOW}STEP 4: Checking port 80...${NC}"
if sudo ss -ltnp | grep -q ':80 '; then
    PROCESS=$(sudo ss -ltnp | grep ':80 ' | awk '{print $6}')
    echo "⚠️  Port 80 is in use by: $PROCESS"
    if echo "$PROCESS" | grep -q nginx; then
        echo "   Stopping nginx to free port 80..."
        sudo systemctl stop nginx 2>/dev/null || true
        sudo systemctl disable nginx 2>/dev/null || true
        echo "✅ Port 80 freed"
    fi
else
    echo "✅ Port 80 is available"
fi
echo ""

# Step 5: Build Docker image (if needed)
echo -e "${YELLOW}STEP 5: Checking Docker image...${NC}"
if docker images | grep -q "bell24h.*latest"; then
    echo "✅ Docker image exists"
    REBUILD=false
else
    echo "❌ Docker image not found - building..."
    REBUILD=true
fi

# Ask if rebuild is needed (if container was crashing, rebuild is safer)
if [ "$RUNNING" = false ] || [ "$REBUILD" = true ]; then
    echo "🔨 Building Docker image (this takes 5-10 minutes)..."
    docker build --no-cache -t bell24h:latest -f Dockerfile . || {
        echo "❌ Build failed - checking for errors..."
        docker build -t bell24h:latest -f Dockerfile . 2>&1 | tail -20
        exit 1
    }
    echo "✅ Build successful"
fi
echo ""

# Step 6: Start container with correct settings
echo -e "${YELLOW}STEP 6: Starting container...${NC}"
docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest || {
    echo "❌ Failed to start container"
    echo "Checking logs..."
    docker logs bell24h 2>&1 | tail -30
    exit 1
}

echo "✅ Container started"
echo ""

# Step 7: Wait for container to be healthy
echo -e "${YELLOW}STEP 7: Waiting for container to start (30 seconds)...${NC}"
sleep 10

# Check if container is still running
if ! docker ps | grep -q bell24h; then
    echo "❌ Container stopped immediately - checking logs..."
    docker logs bell24h 2>&1 | tail -50
    exit 1
fi

echo "✅ Container is running"
sleep 20  # Give app time to fully start
echo ""

# Step 8: Health check
echo -e "${YELLOW}STEP 8: Testing health endpoints...${NC}"

# Test localhost
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Local health check: PASSED${NC}"
else
    echo -e "${RED}❌ Local health check: FAILED${NC}"
    echo "Container logs:"
    docker logs bell24h 2>&1 | tail -20
    exit 1
fi

# Test IP address
if curl -f http://80.225.192.248/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ IP health check: PASSED${NC}"
else
    echo -e "${YELLOW}⚠️  IP health check: May need a moment${NC}"
fi

echo ""

# Step 9: Display status
echo -e "${YELLOW}STEP 9: Final status check...${NC}"
echo ""
echo "Container Status:"
docker ps --filter "name=bell24h" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "Container Logs (last 5 lines):"
docker logs --tail 5 bell24h
echo ""

# Step 10: Verify critical endpoints
echo -e "${YELLOW}STEP 10: Testing critical endpoints...${NC}"
echo ""

ENDPOINTS=(
    "http://localhost/"
    "http://localhost/api/health"
    "http://localhost/auth/login-otp"
)

ALL_PASSED=true
for endpoint in "${ENDPOINTS[@]}"; do
    if curl -f -s "$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ $endpoint${NC}"
    else
        echo -e "${RED}❌ $endpoint${NC}"
        ALL_PASSED=false
    fi
done

echo ""

# Final report
echo "=========================================="
if [ "$ALL_PASSED" = true ]; then
    echo -e "${GREEN}🎉 SUCCESS! Your site should be working now!${NC}"
    echo ""
    echo "✅ Container is running"
    echo "✅ Health checks passed"
    echo "✅ Endpoints accessible"
    echo ""
    echo "Test your site:"
    echo "  - IP: http://80.225.192.248"
    echo "  - Domain: https://bell24h.com (if DNS configured)"
    echo ""
    echo "If you still see 502 error:"
    echo "  1. Wait 2-3 minutes for DNS/CDN cache to clear"
    echo "  2. Check Cloudflare proxy settings (should be ON - orange cloud)"
    echo "  3. Verify SSL/TLS mode is 'Full' in Cloudflare"
else
    echo -e "${YELLOW}⚠️  Some checks failed - but container is running${NC}"
    echo "Check logs: docker logs bell24h"
fi

echo ""
echo "Next steps:"
echo "  1. Wait 2-3 minutes for DNS to propagate"
echo "  2. Test https://bell24h.com in browser"
echo "  3. If still 502, check Cloudflare settings"
echo ""
echo "To view logs: docker logs -f bell24h"
echo "To restart: docker restart bell24h"
echo ""

