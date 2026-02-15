# 🔧 **FIX: Docker Build Error - `.next/standalone` Not Found**

## **Problem:**
```
Step 22/28 : COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY failed: stat app/.next/standalone: file does not exist
```

## **Root Cause:**
Your Dockerfile expects `output: 'standalone'` in `next.config.js`, but it's not enabled.

## **Solution Options:**

### **Option 1: Use the Fixed Dockerfile (RECOMMENDED)**
I've created `client/Dockerfile` that works **WITHOUT** standalone mode.

**On your Oracle VM, run:**
```bash
cd ~/bell24h/client
docker build -t bell24h:latest -f Dockerfile .
```

### **Option 2: Enable Standalone Mode**
If you want to use standalone (smaller image), add to `client/next.config.js`:
```javascript
output: 'standalone',
```

Then rebuild.

### **Option 3: Use Root Dockerfile**
If building from root directory:
```bash
cd ~/bell24h
docker build -t bell24h:latest -f Dockerfile.oracle-fixed .
```

---

## **Quick Fix Commands (SSH into Oracle VM):**

```bash
# 1. Go to client directory
cd ~/bell24h/client

# 2. Use the new Dockerfile (no standalone needed)
docker build -t bell24h:latest -f Dockerfile .

# 3. If build succeeds, run container
docker stop bell24h && docker rm bell24h
docker run -d --name bell24h --restart always -p 3000:3000 --env-file ~/bell24h/client/.env.production bell24h:latest

# 4. Check logs
docker logs --tail=50 bell24h

# 5. Restart Nginx
sudo systemctl restart nginx
```

---

## **Why This Happens:**
- Dockerfile expects `.next/standalone` (created when `output: 'standalone'` is set)
- Your `next.config.js` doesn't have `output: 'standalone'`
- Solution: Use Dockerfile that copies `.next` directly (not standalone)

---

**The new `client/Dockerfile` I created will work immediately!**

