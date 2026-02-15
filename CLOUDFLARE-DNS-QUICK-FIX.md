# ⚡ **CLOUDFLARE DNS QUICK FIX — 2 MINUTES**

## **THE PROBLEM**
You have a **CNAME** record for `bell24h.com` pointing to `bell24h.pages.dev`.  
You're trying to add an **A** record for `bell24h.com` pointing to `80.225.192.248`.  
**DNS doesn't allow both!**

---

## **QUICK FIX (COPY-PASTE STEPS)**

### **STEP 1: DELETE CONFLICTING RECORDS**

**In Cloudflare DNS page, DELETE these 2 records:**

1. **CNAME** `bell24h.com` → `bell24h.pages.dev` (Proxied - orange cloud)
   - Click **Edit** → Click **Delete** → Confirm

2. **CNAME** `www` → `bell24h.pages.dev` (Proxied - orange cloud)
   - Click **Edit** → Click **Delete** → Confirm

---

### **STEP 2: ADD A RECORDS**

**Add record 1:**
- **Type**: `A`
- **Name**: `@` (or blank)
- **Content**: `80.225.192.248`
- **Proxy**: **OFF** (gray cloud - DNS only)
- **TTL**: Auto
- **Save**

**Add record 2:**
- **Type**: `A`
- **Name**: `www`
- **Content**: `80.225.192.248`
- **Proxy**: **OFF** (gray cloud - DNS only)
- **TTL**: Auto
- **Save**

---

## **DONE! ✅**

**Wait 2-5 minutes**, then test:
- `http://bell24h.com` → Should show your app
- `http://www.bell24h.com` → Should show your app

---

## **ENABLE HTTPS (OPTIONAL - 1 MINUTE)**

1. Cloudflare → **SSL/TLS**
2. Set to **Full (Strict)**
3. Wait 5 minutes
4. Test: `https://bell24h.com` → Green lock! 🔒

---

**That's it! Your domain now points to Oracle VM!** 🚀

