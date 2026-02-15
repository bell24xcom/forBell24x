#!/bin/bash

# Bell24h N8N Production Deployment Script
# This script deploys N8N with all required configurations for Bell24h

set -e

echo "🚀 Starting N8N Production Deployment for Bell24h..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
print_status "Creating N8N directories..."
mkdir -p n8n-workflows
mkdir -p n8n-credentials
mkdir -p nginx
mkdir -p ssl
mkdir -p logs

# Set proper permissions
chmod 755 n8n-workflows
chmod 755 n8n-credentials
chmod 755 logs

print_success "Directories created successfully"

# Create environment file if it doesn't exist
if [ ! -f .env.n8n ]; then
    print_status "Creating N8N environment file..."
    cat > .env.n8n << EOF
# N8N Production Environment Variables
# Generated on $(date)

# N8N Configuration
N8N_ADMIN_PASSWORD=$(openssl rand -base64 32)
N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
N8N_JWT_SECRET=$(openssl rand -base64 32)

# Database Configuration
N8N_DB_HOST=postgres
N8N_DB_NAME=n8n
N8N_DB_USER=n8n
N8N_DB_PASSWORD=$(openssl rand -base64 32)

# N8N Host Configuration
N8N_HOST=n8n.bell24h.com
N8N_PROTOCOL=https

# Bell24h Integration
N8N_API_KEY=bell24h-n8n-api-key-2024
N8N_WEBHOOK_SECRET=bell24h-webhook-secret-2024

# Email Configuration (Update with your SMTP details)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@bell24h.com
SMTP_PASS=your-app-password
SMTP_SENDER=Bell24h <noreply@bell24h.com>

# SSL Configuration (Update with your SSL certificate paths)
SSL_CERT_PATH=/etc/nginx/ssl/n8n.bell24h.com.crt
SSL_KEY_PATH=/etc/nginx/ssl/n8n.bell24h.com.key
EOF
    print_success "Environment file created: .env.n8n"
    print_warning "Please update the email and SSL configuration in .env.n8n"
else
    print_status "Environment file already exists"
fi

# Load environment variables
if [ -f .env.n8n ]; then
    export $(cat .env.n8n | grep -v '^#' | xargs)
    print_success "Environment variables loaded"
else
    print_error "Environment file not found"
    exit 1
fi

# Create SSL certificate (self-signed for testing)
if [ ! -f ssl/n8n.bell24h.com.crt ]; then
    print_status "Creating self-signed SSL certificate..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/n8n.bell24h.com.key \
        -out ssl/n8n.bell24h.com.crt \
        -subj "/C=IN/ST=Maharashtra/L=Mumbai/O=Bell24h/OU=IT/CN=n8n.bell24h.com"
    print_success "SSL certificate created"
    print_warning "This is a self-signed certificate. For production, use a proper SSL certificate."
fi

# Stop existing containers
print_status "Stopping existing N8N containers..."
docker-compose -f docker-compose.n8n.yml down || true

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose -f docker-compose.n8n.yml pull

# Start N8N services
print_status "Starting N8N services..."
docker-compose -f docker-compose.n8n.yml up -d

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if N8N is running
print_status "Checking N8N health..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if curl -f -s http://localhost:5678/health > /dev/null 2>&1; then
        print_success "N8N is running and healthy!"
        break
    else
        print_status "Attempt $attempt/$max_attempts: Waiting for N8N to start..."
        sleep 10
        ((attempt++))
    fi
done

if [ $attempt -gt $max_attempts ]; then
    print_error "N8N failed to start after $max_attempts attempts"
    print_status "Checking logs..."
    docker-compose -f docker-compose.n8n.yml logs n8n
    exit 1
fi

# Import Bell24h workflows
print_status "Importing Bell24h workflows..."
if [ -f scripts/setup-n8n-instance.js ]; then
    node scripts/setup-n8n-instance.js
    print_success "Workflows imported successfully"
else
    print_warning "Workflow setup script not found. Please run it manually."
fi

# Test N8N connection
print_status "Testing N8N connection..."
if curl -f -s "http://localhost:5678/api/health" > /dev/null 2>&1; then
    print_success "N8N API is accessible"
else
    print_warning "N8N API test failed, but service is running"
fi

# Display access information
print_success "N8N Deployment Completed Successfully!"
echo ""
echo "📋 Access Information:"
echo "====================="
echo "N8N URL: https://n8n.bell24h.com"
echo "Admin Username: admin"
echo "Admin Password: $N8N_ADMIN_PASSWORD"
echo ""
echo "🔧 Management Commands:"
echo "======================"
echo "Start:  docker-compose -f docker-compose.n8n.yml up -d"
echo "Stop:   docker-compose -f docker-compose.n8n.yml down"
echo "Logs:   docker-compose -f docker-compose.n8n.yml logs -f n8n"
echo "Restart: docker-compose -f docker-compose.n8n.yml restart n8n"
echo ""
echo "📁 Important Files:"
echo "=================="
echo "Environment: .env.n8n"
echo "Workflows: n8n-workflows/"
echo "Credentials: n8n-credentials/"
echo "Logs: logs/"
echo ""
echo "🔗 Next Steps:"
echo "============="
echo "1. Update DNS to point n8n.bell24h.com to this server"
echo "2. Replace self-signed SSL certificate with proper certificate"
echo "3. Update email configuration in .env.n8n"
echo "4. Test workflows using the Bell24h integration"
echo "5. Configure monitoring and backups"
echo ""
print_success "Deployment completed! N8N is ready for Bell24h automation."
