#!/bin/bash

echo "Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found. Please run from client directory."
    exit 1
fi

echo "Installing dependencies..."
npm install

echo "Generating Prisma client..."
npx prisma generate

echo "Building application..."
npm run build

echo "Deploying to Vercel..."
vercel --prod --yes

echo "Deployment complete!"
