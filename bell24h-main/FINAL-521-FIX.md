# ✅ DNS Settings Correct - Final Fix for Error 521

**Good News:** Your DNS records are already set correctly!
- ✅ `bell24h.com` = DNS only (gray cloud)
- ✅ `www` = DNS only (gray cloud)

**If you still see Error 521, it's likely:**
1. Container stopped/crashed
2. Oracle Cloud firewall blocking port 80
3. DNS hasn't fully propagated (wait 5-15 minutes)

---

## 🔍 STEP 1: Verify Container is Running (2 Minutes)

**Run this in SSH:**

```bash
# SSH into VM
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

# Check container
docker ps | grep bell24h

# Should show: Up X minutes ago

# If NOT running, start it:
cd ~/bell24h
docker start bell24h

# Or if doesn't exist:
docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest

# Wait 30 seconds
sleep 30

# Test local
curl http://localhost/api/health

# Should return: {"status":"healthy"...}
```

**✅ If container is running and health check works:** Move to Step 2

**❌ If container stopped or health check fails:** Share the output with me

---

## 🔧 STEP 2: Add Oracle Cloud Firewall Rules (5 Minutes)

**This is likely the issue - Oracle Cloud firewall may be blocking port 80**

### **Option A: Via Oracle Cloud Console (Recommended)**

1. **Go to Oracle Cloud:**
   - https://cloud.oracle.com
   - Login
   - Select your region (Mumbai/Asia Pacific)

2. **Navigate to Networking:**
   - Click hamburger menu (☰) → **Networking** → **Virtual Cloud Networks**
   - Click your VCN (Virtual Cloud Network)

3. **Open Security Lists:**
   - Left sidebar → **Security Lists**
   - Click: **Default Security List**

4. **Add Ingress Rule for HTTP:**
   - Click: **Add Ingress Rules** button
   - Fill in:
     - **Stateless:** Leave unchecked
     - **Source Type:** CIDR
     - **Source CIDR:** `0.0.0.0/0`
     - **IP Protocol:** TCP
     - **Destination Port Range:** `80`
     - **Description:** `Allow HTTP from internet`
   - Click: **Add Ingress Rules**

5. **Add Ingress Rule for HTTPS:**
   - Click: **Add Ingress Rules** again
   - Fill in:
     - **Source CIDR:** `0.0.0.0/0`
     - **IP Protocol:** TCP
     - **Destination Port Range:** `443`
     - **Description:** `Allow HTTPS from internet`
   - Click: **Add Ingress Rules**

6. **Wait 1-2 minutes** for rules to apply

7. **Test:** Visit https://bell24h.com

---

### **Option B: Via Command Line (If you have Oracle CLI)**

```bash
# If you have OCI CLI installed
oci network security-list update \
  --security-list-id <your-security-list-id> \
  --ingress-security-rules file://ingress-rules.json
```

**But Option A is easier for non-coders!**

---

## ⏰ STEP 3: Wait for DNS Propagation (5-15 Minutes)

**Even with correct settings, DNS changes can take time:**

1. **Test from different locations:**
   ```bash
   # Test DNS resolution (from your local computer PowerShell)
   nslookup bell24h.com
   
   # Should return: 80.225.192.248
   ```

2. **Check DNS propagation globally:**
   - Visit: https://www.whatsmydns.net/#A/bell24h.com
   - Should show `80.225.192.248` in most locations

3. **Wait 10-15 minutes** and test again

---

## 🧪 STEP 4: Test Direct IP (Bypass DNS)

**If DNS is the issue, test IP directly:**

1. **In browser, visit:**
   - http://80.225.192.248
   - http://80.225.192.248/api/health

2. **Should work immediately** (bypasses DNS)

3. **If IP works but domain doesn't:**
   - DNS propagation issue (wait 15 minutes)
   - Or Cloudflare cache (purge cache)

---

## 🚨 QUICK TROUBLESHOOTING

**Run this complete check:**

```bash
# SSH into VM
cd ~/bell24h

# 1. Check container
echo "=== Container Status ==="
docker ps | grep bell24h || echo "❌ Container NOT running!"

# 2. Check health
echo ""
echo "=== Health Check ==="
curl -s http://localhost/api/health | head -1 || echo "❌ Health check failed!"

# 3. Check port 80
echo ""
echo "=== Port 80 Status ==="
sudo ss -ltnp | grep ':80 ' || echo "❌ Port 80 not listening!"

# 4. Check external IP
echo ""
echo "=== External IP Test ==="
curl -f -m 5 http://80.225.192.248/api/health 2>&1 | head -1 || echo "⚠️  External IP test failed (may be firewall)"

# 5. Show logs
echo ""
echo "=== Recent Logs ==="
docker logs --tail 5 bell24h
```

**Share the output with me!**

---

## 📊 CURRENT DNS STATUS (From Your Screenshot)

✅ **Correct (DNS Only):**
- `bell24h.com` → 80.225.192.248 (gray cloud)
- `www` → 80.225.192.248 (gray cloud)

⚠️ **Still Proxied (May Cause Issues):**
- `app` → 80.225.192.248 (orange cloud)
- `n8n` → 80.225.192.248 (orange cloud)

**For `app` and `n8n` subdomains:**
- **Option 1:** Turn them to DNS only too (if you don't need Cloudflare CDN)
- **Option 2:** Keep them proxied but add Oracle Cloud firewall rules

**Recommendation:** Turn `app` and `n8n` to DNS only for now (easier)

---

## ✅ EXPECTED RESULT

**After adding firewall rules and waiting 5-15 minutes:**

1. **Visit:** https://bell24h.com
2. **Should see:** Your Bell24h homepage (not error page)
3. **Test:** https://bell24h.com/api/health
4. **Should return:** `{"status":"healthy"...}`

---

## 🎯 PRIORITY ACTION

**Do This RIGHT NOW (in order):**

1. **Check container is running** (Step 1) - 2 minutes
2. **Add Oracle Cloud firewall rules** (Step 2) - 5 minutes
3. **Wait 10 minutes** for DNS/firewall to propagate
4. **Test:** https://bell24h.com

**If still Error 521 after all steps:**
- Share the diagnostic output from Step 4
- I'll help debug further

---

## 💡 WHY THIS HAPPENS

**Error 521 = Cloudflare can reach your DNS but can't connect to origin server**

**Common causes:**
1. ✅ DNS proxy OFF (you have this correct!)
2. ❌ Container stopped (check Step 1)
3. ❌ Oracle Cloud firewall blocking (fix Step 2)
4. ⏰ DNS not propagated yet (wait Step 3)

**Your DNS is correct - now we just need to ensure:**
- Container is running
- Firewall allows connections
- Wait for propagation

---

**Most likely fix: Add Oracle Cloud firewall rules (Step 2)!** 🚀

