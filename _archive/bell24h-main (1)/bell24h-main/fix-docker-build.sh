#!/bin/bash
# Fix Docker build for Oracle VM

cd ~/bell24h

# Remove Cloudflare dependencies from package.json (not needed for Oracle VM)
cd client
sed -i '/@cloudflare\/next-on-pages/d' package.json
sed -i '/wrangler/d' package.json

# Regenerate package-lock.json with legacy peer deps
npm install --legacy-peer-deps --package-lock-only

echo "✅ Fixed package.json - removed Cloudflare dependencies"
echo "✅ Regenerated package-lock.json"

cd ~/bell24h

