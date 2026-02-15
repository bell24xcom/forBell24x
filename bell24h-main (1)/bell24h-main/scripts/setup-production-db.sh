#!/bin/bash

# Bell24h Production Database Setup Script
# This script sets up the production PostgreSQL database

set -e

echo "🚀 Setting up Bell24h Production Database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed. Please install PostgreSQL first.${NC}"
    echo "Installation instructions:"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    echo "  Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating from template...${NC}"
    cp production.env.template .env.local
    echo -e "${YELLOW}📝 Please edit .env.local with your actual database credentials${NC}"
    echo "Required variables:"
    echo "  - DATABASE_URL"
    echo "  - DIRECT_URL"
    echo "  - MSG91_AUTH_KEY"
    echo "  - MSG91_TEMPLATE_ID"
    echo "  - MSG91_SENDER_ID"
    echo ""
    read -p "Press Enter after updating .env.local..."
fi

# Load environment variables
source .env.local

# Extract database connection details
DB_URL=${DATABASE_URL}
if [ -z "$DB_URL" ]; then
    echo -e "${RED}❌ DATABASE_URL not found in .env.local${NC}"
    exit 1
fi

# Parse database URL to get connection details
DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')

echo -e "${GREEN}📊 Database Configuration:${NC}"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"

# Test database connection
echo -e "${YELLOW}🔍 Testing database connection...${NC}"
if PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo "Please check your database credentials in .env.local"
    exit 1
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
npx prisma generate

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma db push

# Seed database with initial data
echo -e "${YELLOW}🌱 Seeding database with initial data...${NC}"
npx prisma db seed

# Verify database setup
echo -e "${YELLOW}✅ Verifying database setup...${NC}"
npx prisma db pull

echo -e "${GREEN}🎉 Production database setup completed successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Update your Vercel environment variables with the values from .env.local"
echo "2. Deploy your application: npx vercel --prod"
echo "3. Test the application: https://www.bell24h.com"
echo ""
echo "Database tables created:"
echo "  - users"
echo "  - otp_verifications"
echo "  - rfqs"
echo "  - quotes"
echo "  - transactions"
echo "  - leads"
echo "  - notifications"
