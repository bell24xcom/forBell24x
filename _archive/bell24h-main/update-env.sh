#!/bin/bash
# Auto-update .env.production with Neon database URL

cd ~/bell24h/client

# Backup original file
cp .env.production .env.production.backup

# Update DATABASE_URL
sed -i "s|DATABASE_URL=.*|DATABASE_URL='postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require\&channel_binding=require'|g" .env.production

# Generate NEXTAUTH_SECRET if not set
if ! grep -q "NEXTAUTH_SECRET=" .env.production || grep -q "NEXTAUTH_SECRET=\${" .env.production; then
    SECRET=$(openssl rand -base64 32)
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET='$SECRET'|g" .env.production
fi

# Set NEXT_PUBLIC_APP_URL
sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL='https://bell24h.com'|g" .env.production

# Set NODE_ENV
sed -i "s|NODE_ENV=.*|NODE_ENV='production'|g" .env.production

echo "✅ Environment file updated!"
echo ""
echo "📋 Updated values:"
grep "DATABASE_URL=" .env.production
grep "NEXTAUTH_SECRET=" .env.production | head -1
grep "NEXT_PUBLIC_APP_URL=" .env.production
grep "NODE_ENV=" .env.production

