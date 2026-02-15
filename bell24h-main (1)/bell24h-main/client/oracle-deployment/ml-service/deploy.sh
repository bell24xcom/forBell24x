#!/bin/bash

echo "🚀 Deploying Bell24h ML Service to Oracle Cloud..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx -y

# Create project directory
mkdir -p /home/ubuntu/bell24h-services/ml-service
cd /home/ubuntu/bell24h-services/ml-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create systemd service
sudo tee /etc/systemd/system/bell24h-ml.service > /dev/null <<EOF
[Unit]
Description=Bell24h ML Service
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/bell24h-services/ml-service
Environment=PATH=/home/ubuntu/bell24h-services/ml-service/venv/bin
ExecStart=/home/ubuntu/bell24h-services/ml-service/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable bell24h-ml
sudo systemctl start bell24h-ml

# Configure Nginx
sudo tee /etc/nginx/sites-available/bell24h-ml > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    location /ml/ {
        proxy_pass http://localhost:8001/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/bell24h-ml /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

echo "✅ ML Service deployed successfully!"
echo "🌐 Service URL: http://$(curl -s ifconfig.me)/ml/"
echo "📊 Health Check: http://$(curl -s ifconfig.me)/ml/health"
