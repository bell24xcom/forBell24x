#!/bin/bash

# Bell24h Vercel Environment Variables Setup Script
# This script helps set up environment variables in Vercel

set -e

echo "🚀 Setting up Vercel Environment Variables for Bell24h..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed. Please install it first.${NC}"
    echo "Installation: npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}🔐 Please login to Vercel first...${NC}"
    vercel login
fi

echo -e "${GREEN}✅ Vercel CLI is ready${NC}"

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    cp production.env.template .env.local
    echo -e "${YELLOW}📝 Please edit .env.local with your actual values before continuing${NC}"
    echo ""
    read -p "Press Enter after updating .env.local..."
fi

# Load environment variables
source .env.local

echo -e "${BLUE}📋 Setting up environment variables in Vercel...${NC}"

# Required environment variables
declare -a env_vars=(
    "DATABASE_URL"
    "DIRECT_URL"
    "MSG91_AUTH_KEY"
    "MSG91_TEMPLATE_ID"
    "MSG91_SENDER_ID"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "NEXT_PUBLIC_SITE_URL"
    "NEXT_PUBLIC_APP_NAME"
    "NEXT_PUBLIC_APP_DESCRIPTION"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
    "ENABLE_VOICE_RFQ"
    "ENABLE_AI_MATCHING"
    "ENABLE_ESCROW_PAYMENTS"
    "ENABLE_REAL_TIME_NOTIFICATIONS"
)

# Optional environment variables
declare -a optional_env_vars=(
    "NEXT_PUBLIC_GA_ID"
    "NEXT_PUBLIC_PLAUSIBLE_DOMAIN"
    "RAZORPAY_KEY_ID"
    "RAZORPAY_KEY_SECRET"
    "SENDGRID_API_KEY"
    "SENDGRID_FROM_EMAIL"
    "REDIS_URL"
    "OPENAI_API_KEY"
    "SENTRY_DSN"
)

# Function to set environment variable
set_env_var() {
    local var_name=$1
    local var_value=$2
    local is_optional=${3:-false}
    
    if [ -z "$var_value" ]; then
        if [ "$is_optional" = true ]; then
            echo -e "${YELLOW}⏭️  Skipping optional variable: $var_name${NC}"
            return
        else
            echo -e "${RED}❌ Required variable $var_name is not set in .env.local${NC}"
            return 1
        fi
    fi
    
    echo -e "${BLUE}🔧 Setting $var_name...${NC}"
    if vercel env add "$var_name" production <<< "$var_value"; then
        echo -e "${GREEN}✅ $var_name set successfully${NC}"
    else
        echo -e "${RED}❌ Failed to set $var_name${NC}"
        return 1
    fi
}

# Set required environment variables
echo -e "${BLUE}📝 Setting required environment variables...${NC}"
for var in "${env_vars[@]}"; do
    var_value="${!var}"
    set_env_var "$var" "$var_value" false
done

# Set optional environment variables
echo -e "${BLUE}📝 Setting optional environment variables...${NC}"
for var in "${optional_env_vars[@]}"; do
    var_value="${!var}"
    set_env_var "$var" "$var_value" true
done

echo -e "${GREEN}🎉 Environment variables setup completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Deploy your application: vercel --prod"
echo "2. Check health endpoint: https://your-domain.vercel.app/api/health"
echo "3. Test OTP functionality"
echo "4. Configure custom domain"
echo ""
echo "Environment variables set:"
echo "✅ Database configuration"
echo "✅ MSG91 OTP configuration"
echo "✅ Next.js configuration"
echo "✅ Security keys"
echo "✅ Feature flags"
echo ""
echo "Optional variables (if configured):"
echo "📊 Analytics"
echo "💳 Payment gateway"
echo "📧 Email service"
echo "🤖 AI services"
echo "📈 Monitoring"
