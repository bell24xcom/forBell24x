# 🔧 **FIX CONNECTION TIMEOUT — 5 MINUTES**

## ⚠️ **THE PROBLEM**

**Error**: `ERR_CONNECTION_TIMED_OUT`

**What this means:**
- ✅ DNS is working (domain resolves to `80.225.192.248`)
- ❌ Cloudflare can't connect to your Oracle VM
- ❌ The server isn't responding on port 80

**Possible causes:**
1. App is still on port 8080 (not port 80)
2. Port 80 not open in Oracle Cloud Security List
3. Container not running
4. Firewall blocking connection

---

## 🔍 **STEP 1: CHECK IF APP IS RUNNING (2 MINUTES)**

### **Test Direct IP Access:**

**In browser, try:**
- `http://80.225.192.248:8080` (if still on port 8080)
- `http://80.225.192.248` (if moved to port 80)

**If port 8080 works but port 80 doesn't**: App is still on 8080

**If both don't work**: Container might not be running

---

## 🔧 **STEP 2: CHECK CONTAINER STATUS (SSH)**

```bash
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

# Check if container is running
docker ps | grep bell24h

# Check container logs
docker logs --tail 50 bell24h

# Check what port it's using
docker ps
```

**Expected output:**
```
CONTAINER ID   IMAGE           PORTS
...            bell24h:latest  0.0.0.0:80->3000/tcp
```

**If you see `:8080->3000`**: Container is on port 8080, need to move to 80

---

## 🚀 **STEP 3: MOVE TO PORT 80 (If Still on 8080)**

**If container is on port 8080, run this:**

```bash
# Stop and remove old container
docker stop bell24h
docker rm bell24h

# Run on port 80
docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest

# Wait a few seconds
sleep 5

# Check if it's running
docker ps | grep bell24h

# Test locally
curl http://localhost/api/health
```

**Expected output:**
```json
{"status":"healthy",...}
```

---

## 🔓 **STEP 4: OPEN PORT 80 IN ORACLE CLOUD (3 MINUTES)**

**This is CRITICAL!** Port 80 must be open for Cloudflare to connect.

### **Steps:**

1. **Go to**: [https://cloud.oracle.com](https://cloud.oracle.com)
2. **Menu (☰) → Networking → Virtual Cloud Networks**
3. **Click your VCN** (the one with your VM)
4. **Click "Security Lists"**
5. **Click "Default Security List"** (or the one your VM uses)
6. **Click "Add Ingress Rules"**
7. **Fill in:**
   - **Source Type**: CIDR
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port Range**: `80`
   - **Description**: `Bell24h Web HTTP`
8. **Click "Add Ingress Rules"**
9. **SAVE**

**Also check port 443 (HTTPS):**
- Repeat steps 6-8 for port `443`
- Description: `Bell24h Web HTTPS`

---

## 🧪 **STEP 5: VERIFY DIRECT ACCESS**

**After opening port 80, test:**

1. **Direct IP**: `http://80.225.192.248`
   - Should show your homepage
   - If this works, Cloudflare can connect

2. **If direct IP works but domain doesn't**:
   - Wait 5-10 minutes for Cloudflare to retry
   - Check Cloudflare SSL/TLS mode (should be "Full" or "Full (Strict)")

---

## 🔒 **STEP 6: CHECK CLOUDFLARE SSL MODE**

**If port 80 is open but HTTPS still times out:**

1. **Go to**: Cloudflare → SSL/TLS → Overview
2. **Check encryption mode**:
   - Should be: **"Full"** or **"Full (Strict)"**
   - NOT: "Off" or "Flexible"
3. **If it's "Off"**: Click "Configure" → Select "Full (Strict)" → Save

**Why this matters:**
- "Off" = No encryption, Cloudflare won't proxy
- "Flexible" = Only encrypts browser → Cloudflare
- "Full" = Encrypts browser → Cloudflare → Your server (HTTP is OK)
- "Full (Strict)" = Same as Full + validates certificate

**For your setup**: Use **"Full"** (your server uses HTTP on port 80)

---

## 📋 **TROUBLESHOOTING CHECKLIST**

### **Check These in Order:**

- [ ] **Direct IP works**: `http://80.225.192.248` (or `:8080`)
- [ ] **Container running**: `docker ps | grep bell24h`
- [ ] **Container on port 80**: Check `docker ps` output
- [ ] **Port 80 open**: Oracle Security List has ingress rule
- [ ] **Port 443 open**: Oracle Security List has ingress rule (for HTTPS)
- [ ] **Cloudflare SSL mode**: Set to "Full" or "Full (Strict)"
- [ ] **Wait 5 minutes**: After changes, wait for propagation

---

## 🎯 **MOST LIKELY FIX**

**Based on your error, most likely issues:**

1. **Port 80 not open in Oracle Cloud** (90% chance)
   - **Fix**: Add ingress rule for port 80 (Step 4)

2. **App still on port 8080** (80% chance)
   - **Fix**: Move container to port 80 (Step 3)

3. **Cloudflare SSL mode wrong** (50% chance)
   - **Fix**: Set to "Full" (Step 6)

---

## 🚀 **QUICK FIX SEQUENCE**

**Do these in order:**

1. **Check container**: `docker ps` (SSH into VM)
2. **If on 8080**: Move to port 80 (Step 3)
3. **Open port 80**: Oracle Cloud Security List (Step 4)
4. **Test direct IP**: `http://80.225.192.248`
5. **Check SSL mode**: Cloudflare → "Full"
6. **Wait 5 minutes**: For changes to propagate
7. **Test domain**: `https://bell24h.com`

---

## 📊 **VERIFICATION**

**After fixes, test:**

```powershell
# Test direct IP
curl http://80.225.192.248

# Test domain (after 5 min wait)
curl http://bell24h.com
```

**Both should return**: Your homepage HTML

---

## 🎉 **AFTER FIX**

Once connection works:

1. ✅ **Direct IP**: `http://80.225.192.248` works
2. ✅ **HTTP Domain**: `http://bell24h.com` works
3. ✅ **HTTPS Domain**: `https://bell24h.com` works (green lock)

---

**TIME**: 5-10 minutes  
**PRIORITY**: 🔴 **CRITICAL** - Do this now!

**Most likely fix**: Open port 80 in Oracle Cloud Security List! 🔓

