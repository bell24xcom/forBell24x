# 🚀 BELL24h Oracle VM Deployment Guide

## ✅ Current Status

- ✅ **Oracle VM**: Running at `80.225.192.248`
- ✅ **n8n**: Running on port 5678
- ✅ **Nginx**: Running
- ❌ **Next.js App**: NOT deployed yet

---

## 📋 Quick Deployment (15-30 mins)

### Step 1: SSH into VM

```bash
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248
```

### Step 2: Upload and Run Deployment Script

**Option A: Copy-paste script directly**

```bash
# Create deployment script
cat > ~/deploy.sh << 'EOF'
#!/bin/bash
set -e

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    sudo apt install -y docker.io docker-compose-plugin
    sudo systemctl enable docker
    sudo systemctl start docker
    sudo usermod -aG docker $USER
    echo "Docker installed. Logout and login, then rerun this script."
    exit 0
fi

# Clone repository
cd ~
if [ -d "bell24h" ]; then
    cd bell24h && git pull
else
    git clone https://github.com/YOUR_GITHUB_USERNAME/bell24h.git
    cd bell24h
fi

# Fix next.config.js (remove static export)
cd client
sed -i "s/output: 'export',/\/\/ output: 'export', \/\/ Disabled for Oracle VM/" next.config.js
cd ..

# Create .env.production (you'll need to edit this)
if [ ! -f "client/.env.production" ]; then
    cp client/env.production.example client/.env.production
    echo "⚠️  EDIT client/.env.production with your actual values!"
    echo "Press Enter after editing..."
    read
fi

# Build Docker image
docker build -t bell24h:latest -f Dockerfile .

# Stop old container
docker stop bell24h-app 2>/dev/null || true
docker rm bell24h-app 2>/dev/null || true

# Run container
docker run -d \
  --name bell24h-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file client/.env.production \
  bell24h:latest

# Wait and verify
sleep 30
curl http://localhost:3000/api/health || docker logs bell24h-app --tail 50

echo "✅ Deployment complete! Test: http://80.225.192.248:3000"
EOF

chmod +x ~/deploy.sh
~/deploy.sh
```

**Option B: Use SCP to upload script from Windows**

```powershell
# In PowerShell on Windows
scp -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" deploy-oracle-vm.sh ubuntu@80.225.192.248:~/deploy.sh

# Then SSH and run
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248 "chmod +x ~/deploy.sh && ~/deploy.sh"
```

---

## 🔧 Manual Step-by-Step (If Script Fails)

### 1. Install Docker

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ubuntu
# Logout and login again
```

### 2. Clone Repository

```bash
cd ~
git clone https://github.com/YOUR_GITHUB_USERNAME/bell24h.git
cd bell24h
```

### 3. Fix next.config.js

```bash
cd client
# Remove static export for Oracle VM
sed -i "s/output: 'export',/\/\/ output: 'export', \/\/ Disabled for Oracle VM/" next.config.js
cd ..
```

### 4. Create Environment File

```bash
cp client/env.production.example client/.env.production
nano client/.env.production  # Edit with your actual values
```

**Required variables:**
- `DATABASE_URL` - Your Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret (generate: `openssl rand -base64 32`)
- `NEXT_PUBLIC_APP_URL` - `https://bell24h.com`
- `N8N_WEBHOOK_URL` - `http://localhost:5678` or `https://n8n.bell24h.com`
- All API keys (OpenAI, MSG91, etc.)

### 5. Build Docker Image

```bash
docker build -t bell24h:latest -f Dockerfile .
```

### 6. Run Container

```bash
docker run -d \
  --name bell24h-app \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file client/.env.production \
  bell24h:latest
```

### 7. Verify

```bash
# Check container status
docker ps | grep bell24h

# Check logs
docker logs bell24h-app

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## 🌐 Configure Nginx (Optional but Recommended)

After app is running, configure Nginx reverse proxy:

```bash
sudo tee /etc/nginx/sites-available/bell24h > /dev/null << 'EOF'
server {
    listen 80;
    server_name bell24h.com www.bell24h.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/bell24h /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔐 SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d bell24h.com -d www.bell24h.com
```

---

## 📊 DNS Configuration (Cloudflare)

After app is running, update Cloudflare DNS:

| Record | Type | Value | Proxy |
|--------|------|-------|-------|
| `@` | A | `80.225.192.248` | DNS Only |
| `www` | A | `80.225.192.248` | DNS Only |
| `api` | A | `80.225.192.248` | DNS Only |
| `n8n` | A | `80.225.192.248` | DNS Only |

**Wait 5-30 mins for DNS propagation.**

---

## 🐛 Troubleshooting

### Container won't start

```bash
docker logs bell24h-app
docker exec -it bell24h-app sh  # Enter container
```

### Port 3000 already in use

```bash
sudo lsof -i :3000
# Kill process or change port in docker run: -p 3001:3000
```

### Build fails

```bash
# Check Dockerfile
cat Dockerfile

# Build with verbose output
docker build -t bell24h:latest -f Dockerfile . --progress=plain
```

### Environment variables not loading

```bash
# Check env file
cat client/.env.production

# Verify container has env vars
docker exec bell24h-app env | grep DATABASE_URL
```

---

## ✅ Success Checklist

- [ ] Docker installed and running
- [ ] Repository cloned
- [ ] `next.config.js` fixed (no static export)
- [ ] `.env.production` configured
- [ ] Docker image built successfully
- [ ] Container running (`docker ps`)
- [ ] Health check passes (`curl http://localhost:3000/api/health`)
- [ ] Nginx configured (optional)
- [ ] SSL certificate installed (optional)
- [ ] DNS updated in Cloudflare
- [ ] Site accessible at `https://bell24h.com`

---

## 🎯 Next Steps After Deployment

1. **Test all API routes**: `/api/login`, `/api/admin/tasks/pending`, etc.
2. **Test OTP flow**: Mobile authentication
3. **Test n8n integration**: Webhooks should work
4. **Monitor logs**: `docker logs -f bell24h-app`
5. **Set up monitoring**: UptimeRobot or similar

---

## 📞 Need Help?

- Check container logs: `docker logs bell24h-app`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check system resources: `htop` or `free -h`

---

**🎉 Once deployed, your B2B empire is LIVE on Oracle VM!**

