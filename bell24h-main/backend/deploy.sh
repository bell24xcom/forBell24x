#!/bin/bash
# BELL24h Production Deployment Script for Oracle VM

set -e

echo "🚀 BELL24h Production Deployment Starting..."
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Installing..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Check if Caddy is installed
if ! command -v caddy &> /dev/null; then
    echo "📦 Installing Caddy..."
    sudo apt update
    sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
    sudo apt update
    sudo apt install -y caddy
fi

# Navigate to project directory
cd ~/bell24h || (echo "❌ Project directory not found. Cloning..." && git clone https://github.com/YOUR_USERNAME/bell24h.git ~/bell24h && cd ~/bell24h)

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin main

# Build Docker image
echo "🏗️  Building Docker image..."
cd backend
docker build -t bell24h-backend:latest .

# Stop and remove old container
echo "🛑 Stopping old container..."
docker stop bell24h-prod || true
docker rm bell24h-prod || true

# Run new container
echo "🚀 Starting new container..."
docker run -d \
    --name bell24h-prod \
    --restart unless-stopped \
    -p 8000:8000 \
    -v $(pwd)/app/models:/app/app/models:ro \
    -v $(pwd)/data:/app/data:ro \
    -v /var/log/bell24h:/var/log/bell24h \
    --health-cmd="python -c 'import urllib.request; urllib.request.urlopen(\"http://localhost:8000/api/health\")'" \
    --health-interval=30s \
    --health-timeout=10s \
    --health-retries=3 \
    bell24h-backend:latest

# Wait for container to be healthy
echo "⏳ Waiting for container to be healthy..."
sleep 10

# Check container status
if docker ps | grep -q bell24h-prod; then
    echo -e "${GREEN}✅ Container is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Container may not be running. Check logs: docker logs bell24h-prod${NC}"
fi

# Setup Caddy
echo "🔒 Configuring Caddy..."
sudo mkdir -p /var/log/caddy
sudo chown caddy:caddy /var/log/caddy

# Copy Caddyfile
sudo cp Caddyfile /etc/caddy/Caddyfile

# Test Caddy configuration
sudo caddy validate --config /etc/caddy/Caddyfile

# Reload Caddy
echo "🔄 Reloading Caddy..."
sudo systemctl reload caddy || sudo systemctl restart caddy

# Check Caddy status
if sudo systemctl is-active --quiet caddy; then
    echo -e "${GREEN}✅ Caddy is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Caddy may not be running. Check status: sudo systemctl status caddy${NC}"
fi

# Test health endpoint
echo "🏥 Testing health endpoint..."
sleep 5
if curl -f http://localhost:8000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend health check passed!${NC}"
else
    echo -e "${YELLOW}⚠️  Health check failed. Check logs: docker logs bell24h-prod${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "📊 Container Status:"
docker ps | grep bell24h-prod
echo ""
echo "📝 View logs: docker logs -f bell24h-prod"
echo "🔍 Check Caddy: sudo systemctl status caddy"
echo "🌐 Test API: curl https://api.bell24h.com/api/health"
echo ""

