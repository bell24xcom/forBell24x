#!/bin/bash
cd ~/bell24h/client
SECRET=$(openssl rand -base64 32)
sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET='$SECRET'|g" .env.production
echo "✅ NEXTAUTH_SECRET generated and set"
grep NEXTAUTH_SECRET .env.production | head -1

