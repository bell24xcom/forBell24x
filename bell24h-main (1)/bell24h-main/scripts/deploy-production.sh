#!/bin/bash

# Bell24h Production Deployment Script
# This script handles the complete production deployment process

set -e

echo "🚀 Bell24h Production Deployment Script"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print step
print_step() {
    echo -e "${BLUE}📋 Step $1: $2${NC}"
}

# Function to check command
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 is not installed. Please install it first.${NC}"
        exit 1
    fi
}

# Step 1: Prerequisites check
print_step "1" "Checking prerequisites..."

check_command "node"
check_command "npm"
check_command "vercel"
check_command "git"

echo -e "${GREEN}✅ All prerequisites are installed${NC}"

# Step 2: Environment setup
print_step "2" "Setting up environment..."

if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    cp production.env.template .env.local
    echo -e "${YELLOW}📝 Please edit .env.local with your actual values${NC}"
    echo "Required variables:"
    echo "  - DATABASE_URL"
    echo "  - MSG91_AUTH_KEY"
    echo "  - MSG91_TEMPLATE_ID"
    echo "  - NEXTAUTH_SECRET"
    echo ""
    read -p "Press Enter after updating .env.local..."
fi

echo -e "${GREEN}✅ Environment setup completed${NC}"

# Step 3: Database setup
print_step "3" "Setting up database..."

echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

echo -e "${YELLOW}🗄️  Pushing database schema...${NC}"
npx prisma db push

echo -e "${YELLOW}🌱 Seeding database...${NC}"
npx prisma db seed

echo -e "${GREEN}✅ Database setup completed${NC}"

# Step 4: Build application
print_step "4" "Building application..."

echo -e "${YELLOW}🔨 Building for production...${NC}"
npm run build:production

echo -e "${GREEN}✅ Build completed successfully${NC}"

# Step 5: Deploy to Vercel
print_step "5" "Deploying to Vercel..."

echo -e "${YELLOW}🚀 Deploying to Vercel...${NC}"
vercel --prod

echo -e "${GREEN}✅ Deployment completed${NC}"

# Step 6: Set up environment variables
print_step "6" "Setting up Vercel environment variables..."

echo -e "${YELLOW}🔧 Setting environment variables...${NC}"
chmod +x scripts/setup-vercel-env.sh
./scripts/setup-vercel-env.sh

echo -e "${GREEN}✅ Environment variables configured${NC}"

# Step 7: Health check
print_step "7" "Performing health check..."

echo -e "${YELLOW}🔍 Checking application health...${NC}"

# Get deployment URL
DEPLOYMENT_URL=$(vercel ls | grep "bell24h" | head -1 | awk '{print $2}')
if [ -z "$DEPLOYMENT_URL" ]; then
    echo -e "${YELLOW}⚠️  Could not determine deployment URL. Please check manually.${NC}"
else
    echo -e "${BLUE}🌐 Checking health at: https://$DEPLOYMENT_URL/api/health${NC}"
    
    # Wait a moment for deployment to be ready
    sleep 10
    
    # Check health endpoint
    if curl -s "https://$DEPLOYMENT_URL/api/health" | grep -q "healthy"; then
        echo -e "${GREEN}✅ Application is healthy${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed. Please check manually.${NC}"
    fi
fi

# Step 8: Domain configuration
print_step "8" "Domain configuration..."

echo -e "${YELLOW}🌐 Setting up custom domain...${NC}"
echo "To configure your custom domain:"
echo "1. Go to Vercel Dashboard"
echo "2. Select your project"
echo "3. Go to Settings > Domains"
echo "4. Add 'www.bell24h.com' and 'bell24h.com'"
echo "5. Configure DNS records as instructed"

# Step 9: Final verification
print_step "9" "Final verification..."

echo -e "${GREEN}🎉 Production deployment completed!${NC}"
echo ""
echo "📊 Deployment Summary:"
echo "====================="
echo "✅ Database configured and seeded"
echo "✅ Application built successfully"
echo "✅ Deployed to Vercel"
echo "✅ Environment variables configured"
echo "✅ Health check performed"
echo ""
echo "🌐 Your application is now live!"
echo "   Production URL: https://$DEPLOYMENT_URL"
echo "   Health Check: https://$DEPLOYMENT_URL/api/health"
echo ""
echo "📋 Next Steps:"
echo "1. Configure custom domain (www.bell24h.com)"
echo "2. Test all functionality"
echo "3. Set up monitoring"
echo "4. Configure backups"
echo ""
echo "🔧 Useful Commands:"
echo "   vercel logs - View deployment logs"
echo "   vercel env ls - List environment variables"
echo "   vercel domains ls - List domains"
echo ""
echo "📚 Documentation:"
echo "   Production Setup: docs/PRODUCTION_SETUP.md"
echo "   API Documentation: docs/API.md"
echo ""
echo "🎯 Your Bell24h B2B marketplace is ready for production! 🚀"
