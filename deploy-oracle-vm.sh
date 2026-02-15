#!/bin/bash
# BELL24h Oracle VM Deployment Script
# Run this on your Oracle VM after SSH

set -e

echo "🚀 BELL24h Oracle VM Deployment Starting..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Don't run as root. Use: sudo where needed${NC}"
   exit 1
fi

# Step 1: Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Installing Docker...${NC}"
    sudo apt install -y docker.io docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo -e "${GREEN}✅ Docker installed. Please logout and login again, then rerun this script.${NC}"
    exit 0
fi

# Step 3: Clone or update repository
REPO_DIR="$HOME/bell24h"
if [ -d "$REPO_DIR" ]; then
    echo -e "${YELLOW}📥 Updating existing repository...${NC}"
    cd $REPO_DIR
    git pull origin main || echo "Git pull failed, continuing..."
else
    echo -e "${YELLOW}📥 Cloning repository...${NC}"
    cd $HOME
    git clone https://github.com/yourorg/bell24h.git || {
        echo -e "${RED}❌ Git clone failed. Please clone manually or check repository URL.${NC}"
        exit 1
    }
    cd $REPO_DIR
fi

# Step 4: Fix next.config.js for Oracle VM (remove static export)
echo -e "${YELLOW}🔧 Fixing next.config.js for Oracle VM...${NC}"
cd client
if grep -q "output: 'export'" next.config.js; then
    sed -i "s/output: 'export',/\/\/ output: 'export', \/\/ Disabled for Oracle VM - need API routes/" next.config.js
    echo -e "${GREEN}✅ Removed static export from next.config.js${NC}"
fi
cd ..

# Step 5: Create environment file
echo -e "${YELLOW}📝 Setting up environment variables...${NC}"
ENV_FILE="$HOME/bell24h/client/.env.production"
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  Creating .env.production from template...${NC}"
    cp client/env.production.example client/.env.production
    echo -e "${RED}⚠️  IMPORTANT: Edit $ENV_FILE with your actual values before continuing!${NC}"
    echo -e "${YELLOW}Press Enter after editing .env.production, or Ctrl+C to exit...${NC}"
    read
fi

# Step 6: Build Docker image
echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
cd $REPO_DIR
docker build -t bell24h:latest -f Dockerfile .

# Step 7: Stop existing container if running
if docker ps -a | grep -q bell24h-app; then
    echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
    docker stop bell24h-app || true
    docker rm bell24h-app || true
fi

# Step 8: Run container
echo -e "${YELLOW}🚀 Starting Next.js app container...${NC}"
docker run -d \
  --name bell24h-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file client/.env.production \
  bell24h:latest

# Step 9: Wait for health check
echo -e "${YELLOW}⏳ Waiting for app to start (30 seconds)...${NC}"
sleep 30

# Step 10: Verify deployment
echo -e "${YELLOW}🔍 Verifying deployment...${NC}"
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ App is running! Health check passed.${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed, but container is running. Checking logs...${NC}"
    docker logs bell24h-app --tail 50
fi

# Step 11: Show status
echo -e "${GREEN}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Container Status:"
docker ps | grep bell24h
echo ""
echo "🌐 Test URLs:"
echo "   http://80.225.192.248:3000"
echo "   http://localhost:3000/api/health"
echo ""
echo "📝 View logs: docker logs -f bell24h-app"
echo "🛑 Stop app: docker stop bell24h-app"
echo "🚀 Restart app: docker start bell24h-app"
echo ""
echo -e "${NC}"

