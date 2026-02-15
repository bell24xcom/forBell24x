# ✅ **SSL ACTIVE — CONFIGURE n8n ROUTING (5 MINUTES)**

## 🎉 **GREAT PROGRESS!**

**What's working:**
- ✅ All DNS records are **"Proxied"** (Orange Cloud)
- ✅ n8n is **running** on port 5678
- ✅ n8n is **accessible** locally (`curl http://localhost:5678` works)
- ⏳ SSL certificates activating (wait 2-5 minutes)

**What needs fixing:**
- ⏳ `n8n.bell24h.com` routes to port 80 (Bell24H app) instead of port 5678 (n8n)

---

## 🔧 **PROBLEM: n8n ROUTING**

**Current situation:**
- `n8n.bell24h.com` → Cloudflare → `80.225.192.248:80` → Bell24H app ❌
- n8n is on port **5678**, but Cloudflare connects to port **80** by default

**Solution:** Configure reverse proxy (Nginx) to route based on hostname

---

## 🔧 **FIX: SETUP NGINX REVERSE PROXY (5 MINUTES)**

### **STEP 1: Install Nginx on VM**

**SSH into your VM (you're already there):**

```bash
# Install Nginx
sudo apt update
sudo apt install -y nginx

# Check if Nginx is running
sudo systemctl status nginx
```

---

### **STEP 2: Configure Nginx for Bell24H App**

**Create Nginx config for main app:**

```bash
sudo nano /etc/nginx/sites-available/bell24h
```

**Paste this content:**

```nginx
server {
    listen 80;
    server_name bell24h.com www.bell24h.com app.bell24h.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

### **STEP 3: Configure Nginx for n8n**

**Create Nginx config for n8n:**

```bash
sudo nano /etc/nginx/sites-available/n8n
```

**Paste this content:**

```nginx
server {
    listen 80;
    server_name n8n.bell24h.com;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Save:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

### **STEP 4: Enable Nginx Sites**

```bash
# Enable Bell24H site
sudo ln -s /etc/nginx/sites-available/bell24h /etc/nginx/sites-enabled/

# Enable n8n site
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx
```

---

### **STEP 5: Update Docker Container Port**

**Stop the Bell24H container and restart on port 3000 (not 80):**

```bash
# Stop and remove current container
docker stop bell24h
docker rm bell24h

# Run new container on port 3000 (Nginx will handle port 80)
docker run -d \
  --name bell24h \
  --restart always \
  -p 3000:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest

# Check if it's running
docker ps | grep bell24h
```

---

### **STEP 6: Test Routing**

**After 2-5 minutes, test in browser:**

| URL | Expected Result |
|-----|----------------|
| `https://bell24h.com` | ✅ GREEN LOCK + Bell24H App |
| `https://www.bell24h.com` | ✅ GREEN LOCK + Bell24H App |
| `https://app.bell24h.com` | ✅ GREEN LOCK + Bell24H App |
| `https://n8n.bell24h.com` | ✅ GREEN LOCK + n8n Workflow |

---

## 📊 **HOW IT WORKS NOW**

**Traffic flow:**

1. **Browser** → `https://bell24h.com`
2. **Cloudflare** → SSL termination → `http://80.225.192.248:80`
3. **Nginx** → Routes to `http://localhost:3000` (Bell24H app) ✅

1. **Browser** → `https://n8n.bell24h.com`
2. **Cloudflare** → SSL termination → `http://80.225.192.248:80`
3. **Nginx** → Routes to `http://localhost:5678` (n8n) ✅

---

## 🧪 **VERIFICATION CHECKLIST**

After setup:

- [ ] Nginx installed and running
- [ ] Bell24H config created (`/etc/nginx/sites-available/bell24h`)
- [ ] n8n config created (`/etc/nginx/sites-available/n8n`)
- [ ] Both sites enabled (`/etc/nginx/sites-enabled/`)
- [ ] Nginx test passed (`sudo nginx -t`)
- [ ] Nginx reloaded (`sudo systemctl reload nginx`)
- [ ] Bell24H container on port 3000 (not 80)
- [ ] Wait 2-5 minutes for SSL
- [ ] Test `https://bell24h.com` → Green lock + App works
- [ ] Test `https://n8n.bell24h.com` → Green lock + n8n works

---

## 🐛 **TROUBLESHOOTING**

### **Issue: "Nginx test fails"**
**Solution:**
- Check config files for syntax errors
- Run `sudo nginx -t` to see specific error
- Verify all brackets are closed

### **Issue: "502 Bad Gateway"**
**Solution:**
- Check if Bell24H container is running: `docker ps | grep bell24h`
- Check if n8n container is running: `docker ps | grep n8n`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`

### **Issue: "n8n.bell24h.com still shows Bell24H app"**
**Solution:**
- Verify Nginx config: `sudo cat /etc/nginx/sites-available/n8n`
- Check Nginx is routing correctly: `sudo nginx -t`
- Restart Nginx: `sudo systemctl restart nginx`

---

## 🎉 **AFTER FIX**

**Reply with:**
> "NGINX REVERSE PROXY CONFIGURED → bell24h.com → PORT 3000 (APP) → n8n.bell24h.com → PORT 5678 (n8n) → SSL ACTIVE → GREEN LOCK ON ALL DOMAINS → FULL EMPIRE SECURE → HTTPS LIVE"

---

**TIME**: 5 minutes  
**PRIORITY**: 🔴 **HIGH** - Do this to fix n8n routing!

**Most important**: Install Nginx → Configure routing → Both app and n8n work with SSL! 🔓

