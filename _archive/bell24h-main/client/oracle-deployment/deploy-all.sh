#!/bin/bash

echo "🚀 BELL24H MICROSERVICES DEPLOYMENT TO ORACLE CLOUD"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Oracle Cloud details
ORACLE_IP="80.225.192.248"
SSH_KEY="C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key"
SSH_USER="ubuntu"

echo -e "${BLUE}📋 Deployment Plan:${NC}"
echo "1. Update Oracle Cloud system"
echo "2. Deploy ML Service (SHAP/LIME)"
echo "3. Deploy Core API (RFQ, Suppliers, Payments)"
echo "4. Configure Nginx reverse proxy"
echo "5. Test all services"
echo "6. Update frontend configuration"
echo ""

# Function to run commands on Oracle Cloud
run_on_oracle() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$ORACLE_IP" "$1"
}

# Function to copy files to Oracle Cloud
copy_to_oracle() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -r "$1" "$SSH_USER@$ORACLE_IP:$2"
}

echo -e "${YELLOW}🔧 Step 1: Updating Oracle Cloud system...${NC}"
run_on_oracle "sudo apt update && sudo apt upgrade -y"

echo -e "${YELLOW}🔧 Step 2: Installing system dependencies...${NC}"
run_on_oracle "sudo apt install python3 python3-pip python3-venv nginx curl -y"

echo -e "${YELLOW}🔧 Step 3: Installing Node.js...${NC}"
run_on_oracle "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs"

echo -e "${YELLOW}🔧 Step 4: Creating project directories...${NC}"
run_on_oracle "mkdir -p /home/ubuntu/bell24h-services/{ml-service,core-api,negotiations,analytics}"

echo -e "${YELLOW}🔧 Step 5: Copying ML Service files...${NC}"
copy_to_oracle "ml-service/" "/home/ubuntu/bell24h-services/"

echo -e "${YELLOW}🔧 Step 6: Copying Core API files...${NC}"
copy_to_oracle "core-api/" "/home/ubuntu/bell24h-services/"

echo -e "${YELLOW}🔧 Step 7: Deploying ML Service...${NC}"
run_on_oracle "cd /home/ubuntu/bell24h-services/ml-service && chmod +x deploy.sh && ./deploy.sh"

echo -e "${YELLOW}🔧 Step 8: Deploying Core API...${NC}"
run_on_oracle "cd /home/ubuntu/bell24h-services/core-api && chmod +x deploy.sh && ./deploy.sh"

echo -e "${YELLOW}🔧 Step 9: Configuring Nginx reverse proxy...${NC}"
run_on_oracle "sudo tee /etc/nginx/sites-available/bell24h > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    # ML Service
    location /ml/ {
        proxy_pass http://localhost:8001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Core API
    location /api/ {
        proxy_pass http://localhost:8002/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # Health check endpoint
    location /health {
        return 200 'All services running';
        add_header Content-Type text/plain;
    }
}
EOF"

echo -e "${YELLOW}🔧 Step 10: Enabling Nginx configuration...${NC}"
run_on_oracle "sudo ln -sf /etc/nginx/sites-available/bell24h /etc/nginx/sites-enabled/ && sudo rm -f /etc/nginx/sites-enabled/default && sudo nginx -t && sudo systemctl reload nginx"

echo -e "${YELLOW}🔧 Step 11: Testing all services...${NC}"

# Test ML Service
echo -e "${BLUE}Testing ML Service...${NC}"
ML_HEALTH=$(run_on_oracle "curl -s http://localhost:8001/health | grep -o '\"status\":\"[^\"]*\"'")
if [[ $ML_HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}✅ ML Service: Healthy${NC}"
else
    echo -e "${RED}❌ ML Service: Unhealthy${NC}"
fi

# Test Core API
echo -e "${BLUE}Testing Core API...${NC}"
CORE_HEALTH=$(run_on_oracle "curl -s http://localhost:8002/health | grep -o '\"status\":\"[^\"]*\"'")
if [[ $CORE_HEALTH == *"healthy"* ]]; then
    echo -e "${GREEN}✅ Core API: Healthy${NC}"
else
    echo -e "${RED}❌ Core API: Unhealthy${NC}"
fi

# Test Nginx
echo -e "${BLUE}Testing Nginx...${NC}"
NGINX_STATUS=$(run_on_oracle "curl -s http://localhost/health")
if [[ $NGINX_STATUS == *"All services running"* ]]; then
    echo -e "${GREEN}✅ Nginx: Healthy${NC}"
else
    echo -e "${RED}❌ Nginx: Unhealthy${NC}"
fi

echo ""
echo -e "${GREEN}🎉 DEPLOYMENT COMPLETED!${NC}"
echo "=================================================="
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "ML Service: http://$ORACLE_IP/ml/"
echo "Core API: http://$ORACLE_IP/api/"
echo "Health Check: http://$ORACLE_IP/health"
echo ""
echo -e "${BLUE}🔧 Service Management:${NC}"
echo "ML Service: sudo systemctl status bell24h-ml"
echo "Core API: sudo systemctl status bell24h-core-api"
echo "Nginx: sudo systemctl status nginx"
echo ""
echo -e "${BLUE}📝 Logs:${NC}"
echo "ML Service: sudo journalctl -u bell24h-ml -f"
echo "Core API: sudo journalctl -u bell24h-core-api -f"
echo "Nginx: sudo tail -f /var/log/nginx/access.log"
echo ""
echo -e "${YELLOW}🔄 Next Steps:${NC}"
echo "1. Update frontend to use new API endpoints"
echo "2. Test SHAP/LIME functionality"
echo "3. Monitor service performance"
echo "4. Deploy additional services as needed"
echo ""
echo -e "${GREEN}✅ Your microservices architecture is now live!${NC}"
