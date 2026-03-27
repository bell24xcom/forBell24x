# 🚀 BELL24h Production Deployment - Quick Start

## ⚡ 5-Minute Deployment Guide

### Step 1: Update DNS (2 minutes)
Add to your domain registrar:
```
A     @    → 76.76.21.21
CNAME www  → cname.vercel-dns.com
CNAME api  → YOUR_ORACLE_VM_IP
```

### Step 2: Deploy Backend (2 minutes)
```bash
ssh ubuntu@YOUR_ORACLE_VM_IP
cd ~/bell24h/backend
chmod +x deploy.sh
./deploy.sh
```

### Step 3: Configure Vercel (1 minute)
Add environment variables in Vercel Dashboard:
- `NEXT_PUBLIC_BACKEND_URL=https://api.bell24h.com`
- `BACKEND_URL=https://api.bell24h.com`
- `NEXT_PUBLIC_APP_URL=https://bell24h.com`

### Step 4: Deploy Frontend (Automatic)
```bash
git push origin main
```

### Step 5: Verify (1 minute)
- ✅ https://api.bell24h.com/api/health
- ✅ https://bell24h.com

## 📁 Files Created

All production files are ready:
- ✅ `backend/Dockerfile` - Docker configuration
- ✅ `backend/Caddyfile` - HTTPS reverse proxy
- ✅ `backend/deploy.sh` - Automated deployment
- ✅ `backend/docker-compose.yml` - Docker Compose
- ✅ `backend/DEPLOYMENT.md` - Full deployment guide
- ✅ `backend/PRODUCTION_CHECKLIST.md` - Deployment checklist
- ✅ `backend/README.md` - Backend documentation

## 🎯 What's Next?

1. **SSH into Oracle VM** and run `./deploy.sh`
2. **Update Vercel environment variables**
3. **Push to GitHub** → Vercel auto-deploys
4. **Verify** all endpoints work

## 📚 Full Documentation

See `PRODUCTION_DEPLOYMENT_SUMMARY.md` for complete details.

---

**Ready to deploy! 🚀**

