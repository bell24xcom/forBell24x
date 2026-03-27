# 🚨 Fix Error 521 - Cloudflare Can't Connect

**Error:** Cloudflare Error 521 - Web server is down  
**Meaning:** Cloudflare proxy can't reach your Oracle VM  
**Status:** Container is running, but Cloudflare can't connect

---

## 🔍 QUICK DIAGNOSIS

**Run this to check:**

```bash
# SSH into VM
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

# Check container
docker ps | grep bell24h

# Test local
curl http://localhost/api/health

# Test external IP
curl http://80.225.192.248/api/health
```

**If local works but external doesn't:** Oracle Cloud firewall is blocking  
**If both work:** Cloudflare proxy settings issue

---

## ✅ SOLUTION 1: Turn OFF Cloudflare Proxy (EASIEST - 2 Minutes)

**This is the quickest fix for Error 521:**

1. **Go to Cloudflare Dashboard:**
   - https://dash.cloudflare.com
   - Login
   - Select: **bell24h.com**

2. **Click: DNS tab** (left sidebar)

3. **Find your A records:**
   - Look for: `@` and `www` records
   - They should show: **Orange cloud** (proxy ON)

4. **Turn OFF Proxy:**
   - Click the **orange cloud** icon
   - It turns **gray** (proxy OFF)
   - Click **Save**

5. **Wait 2 minutes**

6. **Test:** Visit https://bell24h.com

**✅ This should fix Error 521 immediately!**

**Why this works:**
- Cloudflare proxy requires special firewall rules
- DNS-only mode bypasses proxy issues
- Your site will still work (just without Cloudflare CDN)

---

## ✅ SOLUTION 2: Add Oracle Cloud Firewall Rule (If Solution 1 Doesn't Work)

**If turning off proxy doesn't work, Oracle Cloud firewall is blocking:**

1. **Go to Oracle Cloud Console:**
   - https://cloud.oracle.com
   - Login
   - Select your region (Mumbai)

2. **Navigate to Networking:**
   - Menu → **Networking** → **Virtual Cloud Networks**
   - Click your VCN

3. **Open Security Lists:**
   - Click: **Security Lists** (left sidebar)
   - Click: **Default Security List**

4. **Add Ingress Rule:**
   - Click: **Add Ingress Rules**
   - Fill in:
     - **Source Type:** CIDR
     - **Source CIDR:** `0.0.0.0/0` (allow all)
     - **IP Protocol:** TCP
     - **Destination Port Range:** `80`
     - **Description:** "Allow HTTP from Cloudflare"
   - Click: **Add Ingress Rules**

5. **Add HTTPS Rule (Same process):**
   - Port: `443`
   - Description: "Allow HTTPS from Cloudflare"

6. **Wait 1 minute**

7. **Test:** Visit https://bell24h.com

---

## ✅ SOLUTION 3: Check Container Status (If Container Stopped)

**If container stopped, restart it:**

```bash
# SSH into VM
cd ~/bell24h

# Check if container exists
docker ps -a | grep bell24h

# If stopped, start it
docker start bell24h

# If doesn't exist, create it
docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest

# Wait 30 seconds
sleep 30

# Test
curl http://localhost/api/health
```

---

## 🎯 RECOMMENDED FIX (For Non-Coders)

**Do This RIGHT NOW (2 minutes):**

1. **Go to Cloudflare:** https://dash.cloudflare.com
2. **Select:** bell24h.com
3. **Click:** DNS tab
4. **Click:** Orange cloud icons (turn them gray)
5. **Save**
6. **Wait 2 minutes**
7. **Test:** https://bell24h.com

**This fixes 90% of Error 521 cases!**

---

## 📊 VERIFICATION

**After applying fix, test:**

```bash
# From your local computer (PowerShell)
curl https://bell24h.com/api/health

# Should return: {"status":"healthy"...}
```

**Or in browser:**
- Visit: https://bell24h.com
- Should load: Your homepage (not error page)

---

## 🚨 IF STILL NOT WORKING

**Run the diagnostic script:**

```bash
# SSH into VM
cd ~/bell24h

# Download and run fix script
cat > fix-521.sh << 'EOF'
#!/bin/bash
echo "Checking container..."
docker ps | grep bell24h
echo ""
echo "Testing local..."
curl http://localhost/api/health
echo ""
echo "Testing external IP..."
curl http://80.225.192.248/api/health
echo ""
echo "Checking port 80..."
sudo ss -ltnp | grep ':80 '
EOF

chmod +x fix-521.sh
./fix-521.sh
```

**Share the output with me!**

---

## 💡 WHY ERROR 521 HAPPENS

**Error 521 = Cloudflare can't connect to origin server**

**Common causes:**
1. **Cloudflare proxy ON** but Oracle Cloud firewall blocks Cloudflare IPs
2. **Container stopped/crashed**
3. **Port 80 not accessible** from outside
4. **Wrong Cloudflare SSL mode** (should be "Full" not "Flexible")

**Solution 1 (Turn OFF proxy) fixes most cases!**

---

**Try Solution 1 first - it's the easiest and works 90% of the time!** 🚀

