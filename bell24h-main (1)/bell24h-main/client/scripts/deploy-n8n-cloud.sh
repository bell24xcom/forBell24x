#!/bin/bash

# Bell24h N8N Cloud Deployment Script
# Deploys N8N to external cloud services (Railway, Render, or DigitalOcean)

set -e

echo "🚀 Starting N8N Cloud Deployment for Bell24h..."

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

# Check if user has chosen deployment platform
if [ -z "$1" ]; then
    echo "Please choose a deployment platform:"
    echo "1. Railway (Recommended - Free tier available)"
    echo "2. Render (Free tier available)"
    echo "3. DigitalOcean App Platform"
    echo "4. Heroku (Paid only)"
    echo ""
    echo "Usage: ./deploy-n8n-cloud.sh [railway|render|digitalocean|heroku]"
    exit 1
fi

PLATFORM=$1

case $PLATFORM in
    "railway")
        deploy_railway
        ;;
    "render")
        deploy_render
        ;;
    "digitalocean")
        deploy_digitalocean
        ;;
    "heroku")
        deploy_heroku
        ;;
    *)
        print_error "Invalid platform. Choose: railway, render, digitalocean, or heroku"
        exit 1
        ;;
esac

deploy_railway() {
    print_status "Deploying N8N to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        print_status "Installing Railway CLI..."
        npm install -g @railway/cli
    fi

    # Login to Railway
    print_status "Please login to Railway..."
    railway login

    # Create new project
    print_status "Creating Railway project..."
    railway project new bell24h-n8n

    # Set environment variables
    print_status "Setting environment variables..."
    railway variables set N8N_BASIC_AUTH_ACTIVE=true
    railway variables set N8N_BASIC_AUTH_USER=admin
    railway variables set N8N_BASIC_AUTH_PASSWORD=$(openssl rand -base64 32)
    railway variables set N8N_HOST=n8n.bell24h.com
    railway variables set N8N_PORT=5678
    railway variables set N8N_PROTOCOL=https
    railway variables set WEBHOOK_URL=https://n8n.bell24h.com
    railway variables set N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
    railway variables set N8N_JWT_SECRET=$(openssl rand -base64 32)
    railway variables set BELL24H_API_URL=https://www.bell24h.com/api
    railway variables set BELL24H_API_KEY=bell24h-n8n-api-key-2024
    railway variables set BELL24H_WEBHOOK_SECRET=bell24h-webhook-secret-2024

    # Add PostgreSQL database
    print_status "Adding PostgreSQL database..."
    railway add postgresql

    # Deploy
    print_status "Deploying to Railway..."
    railway up

    print_success "N8N deployed to Railway!"
    print_status "Get your Railway URL with: railway domain"
}

deploy_render() {
    print_status "Deploying N8N to Render..."
    
    # Create render.yaml
    cat > render.yaml << EOF
services:
  - type: web
    name: bell24h-n8n
    env: docker
    dockerfilePath: ./Dockerfile.n8n
    plan: free
    envVars:
      - key: N8N_BASIC_AUTH_ACTIVE
        value: true
      - key: N8N_BASIC_AUTH_USER
        value: admin
      - key: N8N_BASIC_AUTH_PASSWORD
        generateValue: true
      - key: N8N_HOST
        value: bell24h-n8n.onrender.com
      - key: N8N_PORT
        value: 5678
      - key: N8N_PROTOCOL
        value: https
      - key: WEBHOOK_URL
        value: https://bell24h-n8n.onrender.com
      - key: N8N_ENCRYPTION_KEY
        generateValue: true
      - key: N8N_JWT_SECRET
        generateValue: true
      - key: BELL24H_API_URL
        value: https://www.bell24h.com/api
      - key: BELL24H_API_KEY
        value: bell24h-n8n-api-key-2024
      - key: BELL24H_WEBHOOK_SECRET
        value: bell24h-webhook-secret-2024
      - key: DB_TYPE
        value: postgresql
      - key: DB_POSTGRESDB_HOST
        fromDatabase:
          name: bell24h-n8n-db
          property: host
      - key: DB_POSTGRESDB_PORT
        fromDatabase:
          name: bell24h-n8n-db
          property: port
      - key: DB_POSTGRESDB_DATABASE
        fromDatabase:
          name: bell24h-n8n-db
          property: database
      - key: DB_POSTGRESDB_USER
        fromDatabase:
          name: bell24h-n8n-db
          property: user
      - key: DB_POSTGRESDB_PASSWORD
        fromDatabase:
          name: bell24h-n8n-db
          property: password

databases:
  - name: bell24h-n8n-db
    plan: free
EOF

    print_success "Created render.yaml configuration"
    print_status "Please:"
    print_status "1. Push this to your GitHub repository"
    print_status "2. Connect your GitHub repo to Render"
    print_status "3. Render will automatically deploy N8N"
    print_status "4. Your N8N will be available at: https://bell24h-n8n.onrender.com"
}

deploy_digitalocean() {
    print_status "Deploying N8N to DigitalOcean App Platform..."
    
    # Create .do/app.yaml
    mkdir -p .do
    cat > .do/app.yaml << EOF
name: bell24h-n8n
services:
- name: n8n
  source_dir: /
  github:
    repo: your-username/bell24h
    branch: main
  run_command: n8n start
  environment_slug: docker
  instance_count: 1
  instance_size_slug: basic-xxs
  http_port: 5678
  routes:
  - path: /
  envs:
  - key: N8N_BASIC_AUTH_ACTIVE
    value: true
  - key: N8N_BASIC_AUTH_USER
    value: admin
  - key: N8N_BASIC_AUTH_PASSWORD
    value: $(openssl rand -base64 32)
  - key: N8N_HOST
    value: bell24h-n8n.ondigitalocean.app
  - key: N8N_PORT
    value: 5678
  - key: N8N_PROTOCOL
    value: https
  - key: WEBHOOK_URL
    value: https://bell24h-n8n.ondigitalocean.app
  - key: N8N_ENCRYPTION_KEY
    value: $(openssl rand -base64 32)
  - key: N8N_JWT_SECRET
    value: $(openssl rand -base64 32)
  - key: BELL24H_API_URL
    value: https://www.bell24h.com/api
  - key: BELL24H_API_KEY
    value: bell24h-n8n-api-key-2024
  - key: BELL24H_WEBHOOK_SECRET
    value: bell24h-webhook-secret-2024

databases:
- name: bell24h-n8n-db
  engine: PG
  version: "13"
  size: db-s-1vcpu-1gb
  num_nodes: 1
EOF

    print_success "Created DigitalOcean App Platform configuration"
    print_status "Please:"
    print_status "1. Install DigitalOcean CLI: doctl"
    print_status "2. Run: doctl apps create --spec .do/app.yaml"
    print_status "3. Your N8N will be available at: https://bell24h-n8n.ondigitalocean.app"
}

deploy_heroku() {
    print_status "Deploying N8N to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        print_error "Please install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli"
        exit 1
    fi

    # Login to Heroku
    print_status "Please login to Heroku..."
    heroku login

    # Create Heroku app
    print_status "Creating Heroku app..."
    heroku create bell24h-n8n

    # Add PostgreSQL addon
    print_status "Adding PostgreSQL database..."
    heroku addons:create heroku-postgresql:mini

    # Set environment variables
    print_status "Setting environment variables..."
    heroku config:set N8N_BASIC_AUTH_ACTIVE=true
    heroku config:set N8N_BASIC_AUTH_USER=admin
    heroku config:set N8N_BASIC_AUTH_PASSWORD=$(openssl rand -base64 32)
    heroku config:set N8N_HOST=bell24h-n8n.herokuapp.com
    heroku config:set N8N_PORT=5678
    heroku config:set N8N_PROTOCOL=https
    heroku config:set WEBHOOK_URL=https://bell24h-n8n.herokuapp.com
    heroku config:set N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)
    heroku config:set N8N_JWT_SECRET=$(openssl rand -base64 32)
    heroku config:set BELL24H_API_URL=https://www.bell24h.com/api
    heroku config:set BELL24H_API_KEY=bell24h-n8n-api-key-2024
    heroku config:set BELL24H_WEBHOOK_SECRET=bell24h-webhook-secret-2024
    heroku config:set DB_TYPE=postgresql

    # Deploy
    print_status "Deploying to Heroku..."
    git push heroku main

    print_success "N8N deployed to Heroku!"
    print_status "Your N8N is available at: https://bell24h-n8n.herokuapp.com"
}

print_success "N8N Cloud Deployment Script Completed!"
echo ""
echo "📋 Next Steps:"
echo "============="
echo "1. Follow the platform-specific instructions above"
echo "2. Update your Vercel environment variables with the N8N URL"
echo "3. Test the connection using: curl https://your-n8n-url.com/api/health"
echo "4. Import Bell24h workflows using the setup script"
echo ""
echo "🔧 Environment Variables to Add to Vercel:"
echo "=========================================="
echo "N8N_API_URL=https://your-n8n-url.com"
echo "N8N_API_KEY=bell24h-n8n-api-key-2024"
echo "N8N_WEBHOOK_SECRET=bell24h-webhook-secret-2024"
echo ""
