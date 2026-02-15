# ⚡ **QUICK FIX: CONNECTION TIMEOUT**

## 🔴 **THE PROBLEM**

`ERR_CONNECTION_TIMED_OUT` = Cloudflare can't reach your Oracle VM

---

## 🎯 **MOST LIKELY FIX (90% CHANCE)**

### **Port 80 Not Open in Oracle Cloud**

**Fix this NOW:**

1. **Go to**: [https://cloud.oracle.com](https://cloud.oracle.com)
2. **Networking → Virtual Cloud Networks**
3. **Click your VCN**
4. **Security Lists → Default Security List**
5. **Add Ingress Rule:**
   - **Source**: `0.0.0.0/0`
   - **Protocol**: TCP
   - **Port**: `80`
   - **Description**: `Bell24h HTTP`
6. **SAVE**

**Also add port 443:**
- Same steps, but **Port**: `443`
- **Description**: `Bell24h HTTPS`

---

## 🔧 **ALSO CHECK (If Above Doesn't Work)**

### **1. Is App on Port 80?**

**SSH into VM:**
```bash
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

docker ps | grep bell24h
```

**If you see `:8080->3000`**: Move to port 80
```bash
docker stop bell24h && docker rm bell24h
docker run -d --name bell24h --restart always -p 80:3000 --env-file ~/bell24h/client/.env.production bell24h:latest
```

### **2. Test Direct IP**

**In browser:**
- `http://80.225.192.248` → Should work
- If it works: Port 80 is the issue
- If it doesn't: Container might be down

### **3. Check Cloudflare SSL Mode**

**Cloudflare → SSL/TLS → Overview**
- Should be: **"Full"** (not "Off" or "Flexible")
- If "Off": Click "Configure" → Select "Full" → Save

---

## ✅ **AFTER FIX**

1. **Wait 5 minutes**
2. **Test**: `http://bell24h.com` → Should work
3. **Test**: `https://bell24h.com` → Should show green lock

---

**TIME**: 3 minutes  
**PRIORITY**: 🔴 **CRITICAL**

**Most likely**: Port 80 not open → Fix in Oracle Cloud! 🔓

