#!/bin/bash
# Fix Docker build error by removing Cloudflare dependencies

cd ~/bell24h

echo "🔧 Removing Cloudflare dependencies from package.json..."

# Remove Cloudflare dependencies from root package.json
sed -i '/"@cloudflare\/next-on-pages":/d' package.json
sed -i '/"wrangler":/d' package.json

# Remove Cloudflare-related scripts
sed -i '/"pages:deploy":/d' package.json
sed -i '/"cf:dev":/d' package.json
sed -i '/"cf:build":/d' package.json
sed -i '/"cf:preview":/d' package.json
sed -i '/"pages:build":/d' package.json

echo "✅ Removed Cloudflare dependencies"
echo ""
echo "📋 Building with fixed dependencies..."

# Now build with the fixed Dockerfile
docker build -t bell24h:latest -f Dockerfile.oracle .

echo ""
echo "✅ Build complete!"

