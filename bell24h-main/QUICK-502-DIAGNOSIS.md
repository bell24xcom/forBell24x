# 🚨 **EMERGENCY 502 FIX GUIDE**

**Date:** November 16, 2025  
**Issue:** 502 Bad Gateway on bell24h.com  
**Status:** n8n server ready, main app needs fixing

---

## 🔍 **ROOT CAUSE: 502 Bad Gateway**

**Problem:** Cloudflare → Oracle VM → Docker container → **CONTAINER DOWN/CRASHED**

**Symptoms:**
- ✅ Browser: Working
- ✅ Cloudflare (Mumbai): Working  
- ❌ **bell24h.com (Host): ERROR** ← **This is the issue**

---

## 🛠️ **IMMEDIATE FIX STEPS**

### **Step 1: SSH into Oracle VM**

```bash
ssh ubuntu@80.225.192.248
```

---

### **Step 2: Run Emergency Fix Script**

```bash
cd ~/bell24h
wget -O emergency-fix.sh https://raw.githubusercontent.com/digitex-erp/bell24h/main/EMERGENCY-502-FIX-SCRIPT.sh
chmod +x emergency-fix.sh
./emergency-fix.sh
```

**OR** copy-paste commands manually:

---

### **Step 3: Manual Fix Commands**

```bash
# 1. Navigate to project
cd ~/bell24h

# 2. Check container status
docker ps -a | grep bell24h

# 3. Stop and remove old container
docker stop bell24h || true
docker rm bell24h || true

# 4. Pull latest code
git fetch origin main
git reset --hard origin/main

# 5. Verify .env.production exists
ls -la client/.env.production

# If missing, create it:
cat > client/.env.production << 'EOF'
NODE_ENV=production
DATABASE_URL=your_neon_db_url_here
NEXTAUTH_URL=https://bell24h.com
NEXTAUTH_SECRET=your_secret_here
NEXT_PUBLIC_APP_URL=https://bell24h.com
EOF

# Edit with your real values:
nano client/.env.production

# 6. Build Docker image
docker build -t bell24h:latest -f Dockerfile .

# 7. Start container
docker run -d \
  --name bell24h \
  --restart always \
  -p 3000:3000 \
  --env-file client/.env.production \
  bell24h:latest

# 8. Wait for startup
sleep 15

# 9. Check container logs
docker logs --tail 50 bell24h

# 10. Test health endpoint
curl http://localhost:3000/api/health

# 11. Verify Nginx
sudo nginx -t
sudo systemctl reload nginx

# 12. Test site
curl -I http://localhost:3000
```

---

## 🔍 **DIAGNOSIS COMMANDS**

### **Check Container Status:**
```bash
docker ps -a
docker logs bell24h
docker inspect bell24h
```

### **Check Port 3000:**
```bash
netstat -tlnp | grep 3000
curl http://localhost:3000
```

### **Check Nginx:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo cat /etc/nginx/sites-enabled/bell24h
```

### **Check .env.production:**
```bash
cat client/.env.production
ls -la client/.env.production
```

---

## 🚨 **COMMON ISSUES & FIXES**

### **Issue 1: Container Not Running**
```bash
# Check why it stopped
docker logs bell24h

# Common causes:
# - Missing .env.production
# - Wrong DATABASE_URL
# - Port 3000 already in use
# - Build errors

# Fix: Rebuild and restart
docker stop bell24h
docker rm bell24h
docker build -t bell24h:latest -f Dockerfile .
docker run -d --name bell24h --restart always -p 3000:3000 --env-file client/.env.production bell24h:latest
```

### **Issue 2: .env.production Missing**
```bash
# Create it:
cat > client/.env.production << 'EOF'
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host/dbname
NEXTAUTH_URL=https://bell24h.com
NEXTAUTH_SECRET=generate-random-secret-here
NEXT_PUBLIC_APP_URL=https://bell24h.com
EOF

# Edit with real values:
nano client/.env.production
```

### **Issue 3: Port 3000 Already in Use**
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill it
sudo kill -9 <PID>

# Or stop nginx if it's using port 80 (might conflict)
sudo systemctl stop nginx
# Then restart container
docker restart bell24h
sudo systemctl start nginx
```

### **Issue 4: Nginx Not Proxying**
```bash
# Check Nginx config
sudo cat /etc/nginx/sites-enabled/bell24h

# Should have:
# server {
#   listen 80;
#   listen 443 ssl;
#   server_name bell24h.com www.bell24h.com;
#   location / {
#     proxy_pass http://localhost:3000;
#   }
# }

# Reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

---

## ✅ **VERIFICATION STEPS**

After running fixes:

1. **Container Running?**
   ```bash
   docker ps | grep bell24h
   ```
   ✅ Should show: `bell24h` container running

2. **Port 3000 Responding?**
   ```bash
   curl http://localhost:3000
   ```
   ✅ Should return: HTML or redirect

3. **Health Check?**
   ```bash
   curl http://localhost:3000/api/health
   ```
   ✅ Should return: `{"status":"ok"}` or similar

4. **Nginx Proxying?**
   ```bash
   curl -I http://localhost
   ```
   ✅ Should return: HTTP headers from port 3000

5. **Site Accessible?**
   - Open: https://bell24h.com
   - ✅ Should load: Dashboard or login page
   - ❌ Still 502? Wait 2-3 minutes for DNS/Cloudflare cache

---

## 📋 **COMPLETE RESTART PROCEDURE**

If nothing works, complete restart:

```bash
# 1. Stop everything
docker stop bell24h || true
docker rm bell24h || true
sudo systemctl stop nginx || true

# 2. Clean up
cd ~/bell24h
git fetch origin main
git reset --hard origin/main

# 3. Verify .env.production
cat client/.env.production

# 4. Rebuild
docker build -t bell24h:latest -f Dockerfile .

# 5. Start container
docker run -d \
  --name bell24h \
  --restart always \
  -p 3000:3000 \
  --env-file client/.env.production \
  bell24h:latest

# 6. Wait
sleep 20

# 7. Start Nginx
sudo systemctl start nginx

# 8. Test
curl http://localhost:3000
curl http://localhost:3000/api/health

# 9. Check logs
docker logs bell24h
```

---

## 🎯 **QUICK TEST CHECKLIST**

- [ ] Container running: `docker ps | grep bell24h`
- [ ] Port 3000 responding: `curl http://localhost:3000`
- [ ] Health check OK: `curl http://localhost:3000/api/health`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] Nginx config valid: `sudo nginx -t`
- [ ] .env.production exists: `ls client/.env.production`
- [ ] Site accessible: https://bell24h.com

---

## 📞 **IF STILL NOT WORKING**

1. **Check Container Logs:**
   ```bash
   docker logs -f bell24h
   ```

2. **Check Nginx Logs:**
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Check System Resources:**
   ```bash
   free -h
   df -h
   top
   ```

4. **Verify Oracle Cloud Firewall:**
   - Port 80: Open
   - Port 443: Open
   - Port 3000: Internal only

---

## ✅ **SUCCESS INDICATORS**

When fixed, you should see:
- ✅ Container running: `docker ps` shows `bell24h`
- ✅ Port 3000 responding: `curl localhost:3000` works
- ✅ Site loads: https://bell24h.com shows login/dashboard
- ✅ No 502 errors: Cloudflare shows green checkmark for Host

---

## 🚀 **AFTER FIX - TEST DEMO LOGIN**

Once site is working:
1. Go to: https://bell24h.com/auth/demo-login
2. Click: **"Demo Login (Temporary)"**
3. Test all dashboard features!

---

**✅ Follow these steps to fix the 502 errors and get your site live!** 🎉

