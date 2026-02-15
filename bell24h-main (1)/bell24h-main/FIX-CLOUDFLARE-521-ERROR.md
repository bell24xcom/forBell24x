# 🔧 **FIX CLOUDFLARE 521 ERROR - QUICK TROUBLESHOOTING GUIDE**

## 🚨 **ERROR DESCRIPTION**

**Cloudflare Error 521**: "Web server is down"  
**Meaning**: Cloudflare can reach your server, but your server is not responding.

**Affected URLs:**
- `https://www.bell24h.com` → Error 521
- `https://n8n.bell24h.com` → Error 521

---

## 🔍 **STEP 1: CHECK IF DOCKER CONTAINER IS RUNNING**

**SSH into your Oracle VM and run:**

```bash
ssh ubuntu@80.225.192.248
```

**Then check Docker containers:**

```bash
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE            STATUS         PORTS                    NAMES
92717232533c   bell24h:latest   Up X minutes   0.0.0.0:3000->3000/tcp   bell24h
adc6da20d0c8   n8nio/n8n:latest Up X hours     0.0.0.0:5678->5678/tcp   n8n_n8n_1
```

**If containers are NOT running:**

```bash
# Start Bell24H container
cd ~/bell24h
docker run -d \
  --name bell24h \
  --restart always \
  -p 3000:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest

# Check n8n container
docker ps -a | grep n8n
# If n8n is stopped, start it:
docker start n8n_n8n_1
```

---

## 🔍 **STEP 2: CHECK IF NGINX IS RUNNING**

**Check Nginx status:**

```bash
sudo systemctl status nginx
```

**Expected Output:**
```
Active: active (running) since ...
```

**If Nginx is NOT running:**

```bash
# Start Nginx
sudo systemctl start nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx

# Check status again
sudo systemctl status nginx
```

**If Nginx fails to start, check configuration:**

```bash
# Test Nginx configuration
sudo nginx -t

# If there are errors, check the config files
sudo nano /etc/nginx/sites-available/bell24h
sudo nano /etc/nginx/sites-available/n8n
```

---

## 🔍 **STEP 3: CHECK IF SERVICES ARE ACCESSIBLE LOCALLY**

**Test Bell24H app locally:**

```bash
curl http://localhost:3000/api/health
```

**Expected Output:**
```json
{"status":"healthy",...}
```

**Test n8n locally:**

```bash
curl http://localhost:5678
```

**Expected Output:**
```html
<!DOCTYPE html>
<title>n8n.io - Workflow Automation</title>
...
```

**If these fail:**
- Docker container might be down
- Ports might not be mapped correctly
- Check container logs: `docker logs bell24h`

---

## 🔍 **STEP 4: CHECK NGINX CONFIGURATION**

**Verify Nginx config files exist:**

```bash
ls -la /etc/nginx/sites-available/
ls -la /etc/nginx/sites-enabled/
```

**Expected Files:**
- `/etc/nginx/sites-available/bell24h`
- `/etc/nginx/sites-available/n8n`
- `/etc/nginx/sites-enabled/bell24h` (symlink)
- `/etc/nginx/sites-enabled/n8n` (symlink)

**If files are missing, recreate them:**

```bash
# Create bell24h config
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

**Create n8n config:**

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

**Enable sites:**

```bash
sudo ln -s /etc/nginx/sites-available/bell24h /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/

# Remove default site if it exists
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🔍 **STEP 5: CHECK FIREWALL RULES**

**Check if port 80 is open:**

```bash
sudo ss -ltnp | grep :80
```

**Expected Output:**
```
LISTEN 0   511   0.0.0.0:80   0.0.0.0:*   users:(("nginx",pid=...,fd=...))
```

**Check Oracle Cloud Security List:**
- Go to Oracle Cloud Console
- Navigate to: Networking → Virtual Cloud Networks → Your VCN → Security Lists
- Ensure Ingress Rule exists:
  - **Source**: `0.0.0.0/0`
  - **IP Protocol**: TCP
  - **Destination Port Range**: `80`
  - **Description**: "HTTP"

**Also check port 443 (HTTPS):**
- Same Security List
- Ensure Ingress Rule exists:
  - **Source**: `0.0.0.0/0`
  - **IP Protocol**: TCP
  - **Destination Port Range**: `443`
  - **Description**: "HTTPS"

---

## 🔍 **STEP 6: CHECK DOCKER CONTAINER LOGS**

**Check Bell24H container logs:**

```bash
docker logs bell24h --tail 50
```

**Check for errors:**
- Database connection errors
- Port binding errors
- Application crashes

**Check n8n container logs:**

```bash
docker logs n8n_n8n_1 --tail 50
```

---

## 🔍 **STEP 7: CHECK SERVER RESOURCES**

**Check if server has enough resources:**

```bash
# Check CPU and memory
top

# Check disk space
df -h

# Check if processes are running
ps aux | grep nginx
ps aux | grep docker
```

**If server is out of resources:**
- Restart containers
- Free up disk space
- Consider upgrading VM

---

## 🔍 **STEP 8: TEST FROM SERVER ITSELF**

**Test if server can reach itself:**

```bash
# Test Bell24H
curl -I http://localhost:3000

# Test Nginx
curl -I http://localhost

# Test from external IP
curl -I http://80.225.192.248
```

**If `curl http://80.225.192.248` fails:**
- Firewall issue
- Security List issue
- Nginx not listening on external IP

---

## 🔍 **STEP 9: CHECK CLOUDFLARE SSL MODE**

**In Cloudflare Dashboard:**
1. Go to: SSL/TLS → Overview
2. Check SSL/TLS encryption mode
3. Should be: **"Full (strict)"** or **"Full"**
4. **NOT**: "Flexible" (this can cause 521 errors)

**If it's "Flexible", change to "Full":**
1. Click "Full" or "Full (strict)"
2. Save changes
3. Wait 2-3 minutes for propagation

---

## 🔍 **STEP 10: RESTART ALL SERVICES**

**Complete restart sequence:**

```bash
# Stop all containers
docker stop bell24h n8n_n8n_1

# Start containers
docker start bell24h n8n_n8n_1

# Restart Nginx
sudo systemctl restart nginx

# Check status
docker ps
sudo systemctl status nginx

# Test locally
curl http://localhost:3000/api/health
curl http://localhost:5678
```

---

## ✅ **QUICK FIX COMMANDS (COPY-PASTE)**

**If you're in a hurry, run these commands in order:**

```bash
# 1. Check Docker containers
docker ps

# 2. If bell24h is not running, start it
cd ~/bell24h
docker run -d \
  --name bell24h \
  --restart always \
  -p 3000:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest

# 3. Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# 4. Test Nginx config
sudo nginx -t

# 5. Reload Nginx
sudo systemctl reload nginx

# 6. Test services
curl http://localhost:3000/api/health
curl http://localhost:5678

# 7. Check Nginx status
sudo systemctl status nginx
```

---

## 🎯 **MOST COMMON CAUSES**

1. **Docker container stopped** → Restart container
2. **Nginx not running** → Start Nginx
3. **Nginx config error** → Fix config and reload
4. **Port 80 blocked** → Check Security List
5. **Server out of resources** → Restart server
6. **Cloudflare SSL mode wrong** → Change to "Full"

---

## ⏱️ **WAIT TIME**

**After fixing:**
- **Cloudflare cache**: 2-5 minutes
- **DNS propagation**: Already done (DNS is working)
- **SSL certificate**: Already active

**Total wait time**: **2-5 minutes** after fixing the server

---

## 📞 **IF STILL NOT WORKING**

**Run this diagnostic script:**

```bash
echo "=== DOCKER STATUS ==="
docker ps

echo "=== NGINX STATUS ==="
sudo systemctl status nginx

echo "=== PORT 80 LISTENING ==="
sudo ss -ltnp | grep :80

echo "=== LOCAL TESTS ==="
curl -I http://localhost:3000
curl -I http://localhost:5678
curl -I http://localhost

echo "=== EXTERNAL IP TEST ==="
curl -I http://80.225.192.248
```

**Send the output for further diagnosis.**

---

**Last Updated**: November 14, 2025  
**Status**: 🔧 **TROUBLESHOOTING GUIDE**

