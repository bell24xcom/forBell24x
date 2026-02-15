# ⚡ QUICK DEPLOY TO ORACLE VM (5 Minutes)

## 🎯 What You Need

1. ✅ SSH access to `80.225.192.248`
2. ✅ Your Neon database URL
3. ✅ Your GitHub repository URL

---

## 🚀 ONE-COMMAND DEPLOYMENT

**SSH into your VM and run this:**

```bash
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248
```

**Then paste this entire block:**

```bash
# Quick Oracle VM Deployment
set -e

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    sudo apt update && sudo apt install -y docker.io docker-compose-plugin
    sudo systemctl enable docker && sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "⚠️  Docker installed. Logout/login, then rerun this script."
    exit 0
fi

# Clone repo
cd ~
[ -d bell24h ] && cd bell24h && git pull || git clone https://github.com/YOUR_USERNAME/bell24h.git && cd bell24h

# Fix next.config.js for Oracle VM
cd client
sed -i "s/output: 'export',/\/\/ output: 'export', \/\/ Disabled for Oracle VM/" next.config.js
cd ..

# Create .env.production
if [ ! -f client/.env.production ]; then
    cp client/env.production.example client/.env.production
    echo "⚠️  EDIT client/.env.production NOW with your actual values!"
    echo "Press Enter after editing..."
    read
fi

# Build and run
docker build -t bell24h:latest -f Dockerfile .
docker stop bell24h-app 2>/dev/null; docker rm bell24h-app 2>/dev/null
docker run -d --name bell24h-app --restart unless-stopped -p 3000:3000 --env-file client/.env.production bell24h:latest

# Wait and test
sleep 30
echo "✅ Testing deployment..."
curl http://localhost:3000/api/health || docker logs bell24h-app --tail 20

echo ""
echo "🎉 DEPLOYMENT COMPLETE!"
echo "🌐 Test: http://80.225.192.248:3000"
echo "📝 Logs: docker logs -f bell24h-app"
```

---

## ⚠️ IMPORTANT: Edit .env.production

Before the script continues, you MUST edit `client/.env.production` with:

1. **DATABASE_URL** - Your Neon PostgreSQL connection string
2. **NEXTAUTH_SECRET** - Generate: `openssl rand -base64 32`
3. **NEXT_PUBLIC_APP_URL** - `https://bell24h.com`
4. All your API keys (OpenAI, MSG91, etc.)

---

## ✅ Verify Deployment

```bash
# Check container
docker ps | grep bell24h

# Check logs
docker logs bell24h-app

# Test health
curl http://localhost:3000/api/health
```

---

## 🌐 Update DNS (After App is Running)

In Cloudflare DNS, set:

- `@` → A record → `80.225.192.248` (DNS Only)
- `www` → A record → `80.225.192.248` (DNS Only)

Wait 5-30 mins for propagation.

---

## 🐛 If Something Fails

```bash
# View logs
docker logs bell24h-app --tail 100

# Check container status
docker ps -a

# Rebuild from scratch
docker stop bell24h-app && docker rm bell24h-app
docker build -t bell24h:latest -f Dockerfile . --no-cache
docker run -d --name bell24h-app --restart unless-stopped -p 3000:3000 --env-file client/.env.production bell24h:latest
```

---

**That's it! Your app should be live in 5-10 minutes.** 🚀

