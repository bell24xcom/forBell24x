#!/bin/bash

# ===========================================
# BELL24H AUTO-DEPLOY SCRIPT
# Deploys local changes to production server
# ===========================================

echo "🚀 BELL24H AUTO-DEPLOY STARTING..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER="165.232.187.195"
USER="root"
REMOTE_PATH="/root/bell24h-app"
LOCAL_COMPONENTS="C:\\Project\\Bell24h\\components"
WINSCP_PATH="/c/Program Files (x86)/WinSCP/WinSCP.com"

echo -e "${BLUE}Step 1: Checking local Git status...${NC}"
cd /c/Project/Bell24h
git status --porcelain
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Git status checked${NC}"
else
    echo -e "${RED}✗ Git status failed${NC}"
    exit 1
fi

echo -e "${BLUE}Step 2: Committing local changes...${NC}"
git add .
git commit -m "Auto-deploy: $(date)" --allow-empty
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Changes committed${NC}"
else
    echo -e "${YELLOW}⚠ No changes to commit or commit failed${NC}"
fi

echo -e "${BLUE}Step 3: Pushing to GitHub...${NC}"
git push origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Pushed to GitHub${NC}"
else
    echo -e "${RED}✗ Push to GitHub failed${NC}"
    exit 1
fi

echo -e "${BLUE}Step 4: Uploading files via WinSCP...${NC}"
if [ -f "$WINSCP_PATH" ]; then
    "$WINSCP_PATH" << EOF
open sftp://root:Bell@2026@$SERVER/
cd $REMOTE_PATH/components/
lcd $LOCAL_COMPONENTS
put header-search-compact.tsx
close
exit
EOF
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Files uploaded via WinSCP${NC}"
    else
        echo -e "${RED}✗ WinSCP upload failed${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠ WinSCP not found, manual upload required${NC}"
    echo -e "${YELLOW}Please upload: $LOCAL_COMPONENTS\\header-search-compact.tsx${NC}"
    echo -e "${YELLOW}To: $REMOTE_PATH/components/${NC}"
    read -p "Press Enter after manual upload..."
fi

echo -e "${BLUE}Step 5: SSH to server and rebuild...${NC}"
ssh -o StrictHostKeyChecking=no $USER@$SERVER << EOF
cd $REMOTE_PATH
echo "Pulling latest changes..."
git pull origin main

echo "Installing dependencies..."
npm install

echo "Rebuilding Docker container..."
docker-compose down
docker-compose up -d --build

echo "Checking container status..."
docker-compose ps

echo "Deployment complete!"
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Server deployment completed${NC}"
else
    echo -e "${RED}✗ Server deployment failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}🌐 Visit: https://www.bell24h.com/test-header${NC}"
echo -e "${GREEN}⏱  Wait 30 seconds for changes to take effect${NC}"
echo ""

# Test the deployment
echo -e "${BLUE}Testing deployment...${NC}"
sleep 10
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://www.bell24h.com/test-header

echo -e "${GREEN}🚀 Deployment script completed successfully!${NC}"