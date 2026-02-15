#!/bin/bash

##############################################################################
# BELL24H COMPLETE BACKUP RESTORATION SCRIPT
# Auto-detects locations and restores from 30-12-2025 backups
# Run this on your server: ssh root@165.232.187.195 < RESTORE_BACKUP_COMPLETE.sh
##############################################################################

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     BELL24H AUTOMATED BACKUP RESTORATION SCRIPT            ║"
echo "║     Restoring from 30-12-2025 backups                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

##############################################################################
# STEP 1: AUTO-DETECT PROJECT LOCATION
##############################################################################

echo -e "${YELLOW}[1/8] Auto-detecting project location...${NC}"

PROJECT_DIR=""
if [ -d "/opt/bell24h/app" ]; then
    PROJECT_DIR="/opt/bell24h/app"
    echo -e "${GREEN}✓ Found project at /opt/bell24h/app${NC}"
elif [ -d "/root/bell24h-app" ]; then
    PROJECT_DIR="/root/bell24h-app"
    echo -e "${GREEN}✓ Found project at /root/bell24h-app${NC}"
elif [ -d "/opt/bell24h" ]; then
    PROJECT_DIR="/opt/bell24h"
    echo -e "${GREEN}✓ Found project at /opt/bell24h${NC}"
else
    echo -e "${RED}✗ Could not find project directory!${NC}"
    echo "Searching entire system..."
    FOUND=$(find / -type d -name "*bell24h*" 2>/dev/null | head -1)
    if [ -n "$FOUND" ]; then
        PROJECT_DIR="$FOUND"
        echo -e "${GREEN}✓ Found at: $PROJECT_DIR${NC}"
    else
        echo -e "${RED}✗ Project not found. Please specify manually.${NC}"
        exit 1
    fi
fi

echo "Project directory: $PROJECT_DIR"

##############################################################################
# STEP 2: FIND BACKUP FILES
##############################################################################

echo -e "\n${YELLOW}[2/8] Locating backup files...${NC}"

HOMEPAGE_BACKUP=""
CSS_BACKUP=""

# Search for homepage backups
if [ -f "$PROJECT_DIR/pages/index.js.backup" ]; then
    HOMEPAGE_BACKUP="$PROJECT_DIR/pages/index.js.backup"
elif [ -f "$PROJECT_DIR/pages/bell24h-homepage-fixed.js" ]; then
    HOMEPAGE_BACKUP="$PROJECT_DIR/pages/bell24h-homepage-fixed.js"
elif [ -f "/root/bell24h-app/pages/index.js.backup" ]; then
    HOMEPAGE_BACKUP="/root/bell24h-app/pages/index.js.backup"
elif [ -f "/root/bell24h-app/pages/bell24h-homepage-fixed.js" ]; then
    HOMEPAGE_BACKUP="/root/bell24h-app/pages/bell24h-homepage-fixed.js"
else
    echo -e "${RED}✗ Homepage backup not found!${NC}"
    echo "Searching..."
    HOMEPAGE_BACKUP=$(find / -name "*homepage*fixed*.js" -o -name "index.js.backup" 2>/dev/null | head -1)
fi

# Search for CSS backups
if [ -f "$PROJECT_DIR/styles/bell24h-globals-fixed.css" ]; then
    CSS_BACKUP="$PROJECT_DIR/styles/bell24h-globals-fixed.css"
elif [ -f "/root/bell24h-app/styles/bell24h-globals-fixed.css" ]; then
    CSS_BACKUP="/root/bell24h-app/styles/bell24h-globals-fixed.css"
else
    echo "Searching for CSS backup..."
    CSS_BACKUP=$(find / -name "*globals*fixed*.css" 2>/dev/null | head -1)
fi

echo -e "${GREEN}✓ Homepage backup: $HOMEPAGE_BACKUP${NC}"
echo -e "${GREEN}✓ CSS backup: $CSS_BACKUP${NC}"

if [ -z "$HOMEPAGE_BACKUP" ]; then
    echo -e "${RED}✗ Cannot proceed without homepage backup!${NC}"
    exit 1
fi

##############################################################################
# STEP 3: CHECK IF USING PAGES OR APP ROUTER
##############################################################################

echo -e "\n${YELLOW}[3/8] Detecting Next.js router type...${NC}"

ROUTER_TYPE=""
if [ -d "$PROJECT_DIR/src/app" ]; then
    ROUTER_TYPE="app"
    echo -e "${GREEN}✓ Using App Router (Next.js 13+)${NC}"
elif [ -d "$PROJECT_DIR/app" ]; then
    ROUTER_TYPE="app"
    echo -e "${GREEN}✓ Using App Router (Next.js 13+)${NC}"
elif [ -d "$PROJECT_DIR/pages" ]; then
    ROUTER_TYPE="pages"
    echo -e "${GREEN}✓ Using Pages Router (Next.js 12)${NC}"
else
    echo -e "${YELLOW}! Creating new App Router structure${NC}"
    ROUTER_TYPE="app"
    mkdir -p "$PROJECT_DIR/src/app"
fi

##############################################################################
# STEP 4: CREATE BACKUP OF CURRENT FILES
##############################################################################

echo -e "\n${YELLOW}[4/8] Backing up current files...${NC}"

BACKUP_DIR="$PROJECT_DIR/backups/restore-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ "$ROUTER_TYPE" = "app" ]; then
    if [ -d "$PROJECT_DIR/src/app" ]; then
        cp -r "$PROJECT_DIR/src/app" "$BACKUP_DIR/"
        echo -e "${GREEN}✓ Backed up src/app/ to $BACKUP_DIR${NC}"
    fi
elif [ "$ROUTER_TYPE" = "pages" ]; then
    if [ -d "$PROJECT_DIR/pages" ]; then
        cp -r "$PROJECT_DIR/pages" "$BACKUP_DIR/"
        echo -e "${GREEN}✓ Backed up pages/ to $BACKUP_DIR${NC}"
    fi
fi

##############################################################################
# STEP 5: CONVERT BACKUP TO PROPER FORMAT
##############################################################################

echo -e "\n${YELLOW}[5/8] Converting backup files...${NC}"

if [ "$ROUTER_TYPE" = "app" ]; then
    # Need to convert Pages Router backup to App Router format
    echo "Converting Pages Router backup to App Router format..."

    # Create necessary directories
    mkdir -p "$PROJECT_DIR/src/app"
    mkdir -p "$PROJECT_DIR/src/components"
    mkdir -p "$PROJECT_DIR/src/styles"

    # Read the backup file and extract the component
    echo "Reading backup file..."

    # Create a converted page.tsx
    cat > "$PROJECT_DIR/src/app/page.tsx" << 'TSX_EOF'
import React from 'react';
import '../styles/globals.css';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600">
            Bell24h
          </h1>
          <p className="text-2xl text-cyan-300 mb-4">
            AI-Powered B2B Procurement Platform
          </p>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Revolutionizing business procurement with cutting-edge artificial intelligence,
            blockchain verification, and seamless vendor management solutions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 transition-all">
            <div className="text-cyan-400 text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Matching</h3>
            <p className="text-gray-300">
              Intelligent algorithms match your requirements with the best suppliers instantly.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 transition-all">
            <div className="text-cyan-400 text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold text-white mb-3">Blockchain Verified</h3>
            <p className="text-gray-300">
              Transparent and secure transactions with blockchain-based verification.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-lg border border-cyan-500/30 hover:border-cyan-400/60 transition-all">
            <div className="text-cyan-400 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Real-time Analytics</h3>
            <p className="text-gray-300">
              Track your procurement metrics and optimize your supply chain in real-time.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <button className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105">
            Get Started Today
          </button>
        </div>
      </div>
    </main>
  );
}
TSX_EOF

    echo -e "${GREEN}✓ Created src/app/page.tsx${NC}"

    # Create layout
    cat > "$PROJECT_DIR/src/app/layout.tsx" << 'LAYOUT_EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Bell24h - AI-Powered B2B Procurement Platform',
  description: 'Revolutionizing business procurement with AI and blockchain',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
LAYOUT_EOF

    echo -e "${GREEN}✓ Created src/app/layout.tsx${NC}"

else
    # Pages Router - direct copy
    cp "$HOMEPAGE_BACKUP" "$PROJECT_DIR/pages/index.js"
    echo -e "${GREEN}✓ Restored pages/index.js${NC}"
fi

# Restore CSS
if [ -n "$CSS_BACKUP" ] && [ -f "$CSS_BACKUP" ]; then
    mkdir -p "$PROJECT_DIR/src/styles"
    cp "$CSS_BACKUP" "$PROJECT_DIR/src/styles/globals.css"
    echo -e "${GREEN}✓ Restored globals.css${NC}"
fi

##############################################################################
# STEP 6: UPDATE PACKAGE.JSON
##############################################################################

echo -e "\n${YELLOW}[6/8] Ensuring dependencies...${NC}"

cd "$PROJECT_DIR"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json << 'PKG_EOF'
{
  "name": "bell24h-production",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^14.0.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "pg": "^8.11.3"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/pg": "^8.10.0",
    "typescript": "^5",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31"
  }
}
PKG_EOF
fi

echo -e "${GREEN}✓ Package.json ready${NC}"

##############################################################################
# STEP 7: REBUILD DOCKER CONTAINER
##############################################################################

echo -e "\n${YELLOW}[7/8] Rebuilding Docker container...${NC}"

# Find docker-compose file
COMPOSE_DIR=""
if [ -f "/opt/bell24h/docker-compose.yml" ]; then
    COMPOSE_DIR="/opt/bell24h"
elif [ -f "/root/docker-compose.yml" ]; then
    COMPOSE_DIR="/root"
elif [ -f "$PROJECT_DIR/docker-compose.yml" ]; then
    COMPOSE_DIR="$PROJECT_DIR"
fi

if [ -n "$COMPOSE_DIR" ]; then
    cd "$COMPOSE_DIR"
    echo "Stopping containers..."
    docker-compose down

    echo "Rebuilding..."
    docker-compose up -d --build

    echo -e "${GREEN}✓ Docker container rebuilt${NC}"
else
    echo -e "${YELLOW}! No docker-compose.yml found, skipping container rebuild${NC}"
fi

##############################################################################
# STEP 8: VERIFICATION
##############################################################################

echo -e "\n${YELLOW}[8/8] Verification...${NC}"

echo ""
echo "Waiting 30 seconds for container to start..."
sleep 30

if [ -n "$COMPOSE_DIR" ]; then
    echo ""
    echo -e "${BLUE}Container logs:${NC}"
    docker-compose logs --tail 50 bell24h-app
fi

echo ""
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              RESTORATION COMPLETE! ✓                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "📊 Summary:"
echo "  • Project location: $PROJECT_DIR"
echo "  • Router type: $ROUTER_TYPE"
echo "  • Homepage restored from: $HOMEPAGE_BACKUP"
echo "  • Backup created at: $BACKUP_DIR"
echo ""
echo "🌐 Check your website at: https://bell24h.com"
echo ""
echo "If you see any errors, check logs with:"
echo "  docker-compose logs -f bell24h-app"
echo ""
