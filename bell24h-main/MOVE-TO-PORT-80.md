# 🔧 **MOVE APP TO PORT 80 — 5 MINUTES**

## **WHY**
- Port 80 is standard HTTP (no `:8080` needed)
- Cleaner URLs: `http://80.225.192.248` instead of `:8080`
- Required for HTTPS/SSL setup

---

## **STEP-BY-STEP**

### **Step 1: Stop Current Container (30 seconds)**

```bash
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

docker stop bell24h
docker rm bell24h
```

---

### **Step 2: Check if Port 80 is Free (30 seconds)**

```bash
sudo netstat -tulpn | grep :80
# OR
sudo lsof -i :80
```

**If something is using port 80:**
```bash
# Stop Nginx (if running)
sudo systemctl stop nginx
sudo systemctl disable nginx
```

---

### **Step 3: Run Container on Port 80 (30 seconds)**

```bash
cd ~/bell24h

docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest
```

---

### **Step 4: Verify (30 seconds)**

```bash
# Check container is running
docker ps | grep bell24h

# Check health
curl http://localhost/api/health

# Check logs
docker logs --tail 20 bell24h
```

**Expected output:**
```json
{"status":"healthy",...}
```

---

### **Step 5: Open Port 80 in Oracle Cloud (3 minutes)**

1. Go to: [https://cloud.oracle.com](https://cloud.oracle.com)
2. **Menu (☰) → Networking → Virtual Cloud Networks**
3. Click your VCN
4. Click **Security Lists**
5. Click **Default Security List**
6. Click **Add Ingress Rules**
7. Fill in:
   - **Source Type**: CIDR
   - **Source CIDR**: `0.0.0.0/0`
   - **IP Protocol**: TCP
   - **Destination Port Range**: `80`
   - **Description**: `Bell24h Web HTTP`
8. Click **Add Ingress Rules**
9. **SAVE**

---

### **Step 6: Test from Browser (30 seconds)**

Open: `http://80.225.192.248`

**Should see**: Bell24H homepage (no `:8080` needed!)

---

## **TROUBLESHOOTING**

### **Issue: "Port 80 already in use"**
```bash
# Find what's using port 80
sudo lsof -i :80

# Stop it (usually Nginx)
sudo systemctl stop nginx
sudo systemctl disable nginx
```

### **Issue: "Connection refused"**
- Check Oracle Security List (Step 5)
- Verify firewall allows port 80
- Check container logs: `docker logs bell24h`

### **Issue: "Container exits immediately"**
```bash
# Check logs
docker logs bell24h

# Common issues:
# - .env.production missing
# - Database connection failed
# - Port conflict
```

---

## **VERIFICATION CHECKLIST**

- [ ] Container running: `docker ps | grep bell24h`
- [ ] Health check works: `curl http://localhost/api/health`
- [ ] Port 80 open in Oracle Security List
- [ ] Browser access works: `http://80.225.192.248`
- [ ] No `:8080` needed in URL

---

**TIME**: 5 minutes  
**PRIORITY**: 🔴 High (do before DNS setup)

