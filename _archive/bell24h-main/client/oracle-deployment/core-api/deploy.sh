#!/bin/bash

echo "🚀 Deploying Bell24h Core API to Oracle Cloud..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Create project directory
mkdir -p /home/ubuntu/bell24h-services/core-api
cd /home/ubuntu/bell24h-services/core-api

# Copy files (assuming they're already uploaded)
# cp -r /path/to/core-api/* .

# Install dependencies
npm install

# Create systemd service
sudo tee /etc/systemd/system/bell24h-core-api.service > /dev/null <<EOF
[Unit]
Description=Bell24h Core API Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/bell24h-services/core-api
ExecStart=/usr/bin/node server.js
Restart=always
Environment=NODE_ENV=production
Environment=PORT=8002

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable bell24h-core-api
sudo systemctl start bell24h-core-api

# Configure Nginx
sudo tee /etc/nginx/sites-available/bell24h-core-api > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://localhost:8002/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/bell24h-core-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Core API deployed successfully!"
echo "🌐 Service URL: http://$(curl -s ifconfig.me)/api/"
echo "📊 Health Check: http://$(curl -s ifconfig.me)/api/health"
