#!/bin/bash

# Oracle Cloud Always Free N8N Setup Script
# This script sets up N8N on Oracle Cloud Always Free tier

set -e

echo "🚀 Setting up N8N on Oracle Cloud Always Free..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root for security reasons"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    print_success "Docker installed successfully"
else
    print_success "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose already installed"
fi

# Install additional tools
print_status "Installing additional tools..."
sudo apt install -y curl wget git ufw fail2ban

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 5678/tcp # N8N (if direct access needed)
sudo ufw --force enable

# Configure fail2ban
print_status "Configuring fail2ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create SSL certificates
print_status "Creating SSL certificates..."
mkdir -p ssl
if [ ! -f ssl/cert.pem ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=Bell24h/OU=IT/CN=n8n.bell24h.com"
    print_success "SSL certificates created"
else
    print_success "SSL certificates already exist"
fi

# Create environment file
print_status "Creating environment file..."
if [ ! -f .env ]; then
    cp env.example .env
    print_warning "Please edit .env file with your configuration"
    print_warning "Run: nano .env"
else
    print_success "Environment file already exists"
fi

# Create directories
print_status "Creating directories..."
mkdir -p workflows
mkdir -p credentials
mkdir -p ssl
chmod 755 workflows credentials ssl

# Set proper permissions
print_status "Setting permissions..."
chmod 600 .env
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem

print_success "Oracle Cloud setup completed!"
echo ""
echo "📋 Next Steps:"
echo "============="
echo "1. Edit .env file with your configuration:"
echo "   nano .env"
echo ""
echo "2. Start N8N services:"
echo "   docker-compose up -d"
echo ""
echo "3. Check logs:"
echo "   docker-compose logs -f n8n"
echo ""
echo "4. Access N8N at: https://your-server-ip"
echo "   Username: admin"
echo "   Password: (from .env file)"
echo ""
echo "🔧 Management Commands:"
echo "======================"
echo "Start:  docker-compose up -d"
echo "Stop:   docker-compose down"
echo "Logs:   docker-compose logs -f n8n"
echo "Restart: docker-compose restart n8n"
echo ""
echo "📁 Important Files:"
echo "=================="
echo "Environment: .env"
echo "Workflows: workflows/"
echo "Credentials: credentials/"
echo "SSL: ssl/"
echo ""
print_success "Setup completed! Follow the next steps above."
