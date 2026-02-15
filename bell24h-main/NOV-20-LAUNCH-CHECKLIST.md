# 🚀 BELL24h Launch Checklist - November 20, 2025

**Target Launch Date:** November 20, 2025  
**Current Status:** Site deployed, fixing 502 error  
**Completion Target:** 100% ready by Nov 20

---

## 📋 AUTOMATED PRE-LAUNCH CHECKLIST

### ✅ PHASE 1: CRITICAL FIXES (Do This NOW - 30 Minutes)

#### **Step 1: Fix 502 Bad Gateway Error** ⏱️ 10 minutes

**Automated Script (Copy-Paste):**

```bash
# SSH into your VM
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

# Run the automated fix script
cd ~/bell24h
chmod +x auto-fix-502-and-deploy.sh
./auto-fix-502-and-deploy.sh
```

**What This Does:**
- ✅ Checks container status
- ✅ Stops/removes broken container
- ✅ Verifies all files exist
- ✅ Creates missing .env.production
- ✅ Frees port 80 if needed
- ✅ Rebuilds Docker image if needed
- ✅ Starts container correctly
- ✅ Runs health checks
- ✅ Tests all endpoints

**Expected Result:** 
- Container running
- Health check: `{"status":"ok"}`
- Website accessible at IP

**✅ Success Check:**
```bash
curl http://localhost/api/health
# Should return: {"status":"ok"}
```

---

#### **Step 2: Verify DNS Configuration** ⏱️ 5 minutes

**In Cloudflare Dashboard:**

1. Go to: https://dash.cloudflare.com
2. Select: bell24h.com
3. Click: DNS tab
4. **Verify these records exist:**

   | Type | Name | Content | Proxy |
   |------|------|---------|-------|
   | A | @ | 80.225.192.248 | **ON** (orange cloud) |
   | A | www | 80.225.192.248 | **ON** (orange cloud) |

5. **If records missing or wrong:**
   - Click "Add record"
   - Fill in table above
   - Click "Save"

6. **Go to SSL/TLS tab:**
   - Set encryption mode to: **"Full"**
   - Save

**✅ Success Check:**
- Visit https://bell24h.com
- Should load (not 502 error)
- Padlock icon in browser

---

#### **Step 3: Verify Environment Variables** ⏱️ 5 minutes

**Run This Check:**

```bash
# SSH into VM
cd ~/bell24h

# Check .env.production exists and has real values
cat client/.env.production

# Should show:
# - DATABASE_URL (with real Neon connection)
# - NEXTAUTH_SECRET (long random string)
# - NEXTAUTH_URL=https://bell24h.com
```

**If Missing Values:**
```bash
# Generate new secret
SECRET=$(openssl rand -base64 32)

# Update .env.production
cat > client/.env.production << EOF
DATABASE_URL=postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEXTAUTH_URL=https://bell24h.com
NEXTAUTH_SECRET=$SECRET
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bell24h.com
EOF

# Restart container
docker restart bell24h
```

**✅ Success Check:**
- Container restarts without errors
- Health check still works

---

### ✅ PHASE 2: PRE-LAUNCH TESTING (Nov 16-18)

#### **Step 4: Critical Feature Testing** ⏱️ 30 minutes

**Test These URLs (Copy-Paste Each):**

```
Homepage: https://bell24h.com
Login: https://bell24h.com/auth/login-otp
Health: https://bell24h.com/api/health
Dashboard: https://bell24h.com/supplier/dashboard
Video RFQ: https://bell24h.com/rfq/video
Voice RFQ: https://bell24h.com/rfq/voice
Categories: https://bell24h.com/categories
Admin: https://bell24h.com/admin/dashboard
```

**Expected Results:**
- ✅ All pages load (not 404 or 500)
- ✅ Login page shows OTP form
- ✅ Health endpoint returns JSON
- ✅ Dashboard loads (may require login)

**If Any Fail:**
```bash
# Check logs
docker logs bell24h

# Restart container
docker restart bell24h

# Wait 30 seconds
sleep 30

# Test again
curl https://bell24h.com/api/health
```

---

#### **Step 5: OTP SMS Integration Test** ⏱️ 10 minutes

**Test Login Flow:**

1. **Visit:** https://bell24h.com/auth/login-otp
2. **Enter:** Your mobile number (test number)
3. **Click:** "Send OTP"
4. **Expected:** OTP SMS received on your phone

**If OTP Not Received:**
- Check MSG91 Flow ID is approved (takes 1-3 days)
- Verify MSG91 credentials in code
- Test with curl:

```bash
# Test MSG91 API directly
curl -X POST "https://control.msg91.com/api/v5/flow/" \
  -H "authkey: YOUR_MSG91_KEY" \
  -d '{
    "template_id": "YOUR_FLOW_ID",
    "mobiles": "91YOUR_PHONE",
    "company_name": "Test"
  }'
```

**✅ Success Check:**
- OTP SMS received within 30 seconds
- Can verify OTP and login

---

#### **Step 6: Database Connection Test** ⏱️ 5 minutes

**Check Neon Database:**

1. **Go to:** https://console.neon.tech
2. **Select:** Your project
3. **Click:** SQL Editor
4. **Run:**

```sql
-- Check supplier count
SELECT COUNT(*) FROM suppliers;

-- Check categories
SELECT COUNT(*) FROM categories;

-- Check recent data
SELECT * FROM suppliers LIMIT 5;
```

**Expected:**
- ✅ Tables exist
- ✅ Data is present (from your seeded data)
- ✅ No connection errors

**If Errors:**
- Verify DATABASE_URL in .env.production
- Check Neon database is running
- Restart container

---

### ✅ PHASE 3: N8N AUTOMATION (Nov 17-19)

#### **Step 7: Activate Existing Workflow** ⏱️ 15 minutes

**In n8n (http://n8n.bell24h.com):**

1. **Open:** "Bell24H AI Category Worker - Complete"
2. **Click:** Toggle "Active" (top-right)
3. **Test Execution:**
   - Click "Execute workflow"
   - Watch nodes light up
   - Should complete without errors

**✅ Success Check:**
- Workflow status: "Active" (green)
- Test execution: All nodes green (✓)
- No red errors

---

#### **Step 8: Build Workflow A (Company Invitation)** ⏱️ 30 minutes

**This is CRITICAL for Nov 20 launch - automates supplier acquisition**

**Simple Steps:**

1. **In n8n, click:** "New Workflow"
2. **Name:** "A - Company Profile Invitation"
3. **Add Nodes (I'll provide exact config):**
   - Schedule Trigger (daily 9 AM)
   - Postgres (get 100 companies)
   - MSG91 SMS node
   - Update database node

**I'll provide complete workflow JSON in next step.**

**✅ Success Check:**
- Workflow saved
- Can execute manually
- SMS sent successfully

---

#### **Step 9: Build Workflow B (Auto-Onboarding)** ⏱️ 20 minutes

**Automates welcome emails and profile completion**

**Similar process to Workflow A - I'll provide config.**

---

### ✅ PHASE 4: FINAL PRE-LAUNCH (Nov 19)

#### **Step 10: Complete Smoke Test** ⏱️ 1 hour

**Test ALL User Flows:**

1. **Supplier Registration:**
   - [ ] Can claim company profile
   - [ ] Can upload products
   - [ ] Can verify business
   - [ ] Receives welcome email

2. **Buyer Registration:**
   - [ ] Can create account
   - [ ] Can post RFQ (text/voice/video)
   - [ ] Receives supplier matches

3. **RFQ Flow:**
   - [ ] RFQ created successfully
   - [ ] n8n workflow triggers
   - [ ] Suppliers notified
   - [ ] Can respond to RFQ

4. **Dashboard Features:**
   - [ ] Can view analytics
   - [ ] Can manage products
   - [ ] Can view inquiries
   - [ ] Payment integration works

**✅ Success Check:**
- All flows work end-to-end
- No critical errors in logs
- Site is fast (<3 seconds load)

---

#### **Step 11: Performance Check** ⏱️ 15 minutes

**Run These Commands:**

```bash
# Check container resources
docker stats bell24h --no-stream

# Should show:
# - CPU < 50%
# - Memory < 2GB
# - No errors

# Check response times
curl -w "@-" -o /dev/null -s https://bell24h.com << 'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF

# Should show < 1 second total time
```

**✅ Success Check:**
- Page load < 2 seconds
- API response < 500ms
- No memory leaks

---

#### **Step 12: Security Check** ⏱️ 10 minutes

**Verify:**

1. **HTTPS Working:**
   - [ ] https://bell24h.com loads
   - [ ] Padlock icon shows
   - [ ] No mixed content warnings

2. **Environment Variables:**
   - [ ] No secrets in code
   - [ ] .env.production not exposed
   - [ ] NEXTAUTH_SECRET is random

3. **Database Security:**
   - [ ] Connection uses SSL
   - [ ] Credentials in env only
   - [ ] No public access

**✅ Success Check:**
- All security checks pass
- No warnings in browser console

---

## 🎯 NOVEMBER 20 LAUNCH DAY CHECKLIST

### **Launch Day (Nov 20, 2025):**

**Morning (9 AM - 12 PM):**

- [ ] Final smoke test (all features)
- [ ] Monitor error logs (docker logs bell24h)
- [ ] Test OTP login one more time
- [ ] Verify n8n workflows are active

**Launch Time (2 PM IST):**

- [ ] Announce on LinkedIn/Twitter
- [ ] Send welcome emails to beta users
- [ ] Activate Workflow A (company invitations)
- [ ] Monitor first signups

**Evening (6 PM):**

- [ ] Review signup metrics
- [ ] Check for any errors
- [ ] Respond to user feedback
- [ ] Celebrate! 🎉

---

## 🚨 TROUBLESHOOTING GUIDE

### **If 502 Error Persists:**

```bash
# Run automated fix
cd ~/bell24h
./auto-fix-502-and-deploy.sh

# If still fails, check:
docker logs bell24h | tail -50
docker ps -a | grep bell24h
curl http://localhost/api/health
```

### **If Container Keeps Crashing:**

```bash
# Check logs for errors
docker logs bell24h 2>&1 | grep -i error

# Common fixes:
# 1. Database connection issue
#    → Verify DATABASE_URL in .env.production

# 2. Memory issue
#    → Restart VM: sudo reboot

# 3. Port conflict
#    → Stop nginx: sudo systemctl stop nginx
```

### **If DNS Not Working:**

1. Wait 15 minutes (DNS propagation)
2. Check Cloudflare DNS records
3. Test with: `nslookup bell24h.com`
4. Should return: `80.225.192.248`

---

## 📊 SUCCESS METRICS (Launch Day)

**Target Metrics for Nov 20:**

- ✅ Website uptime: 99.9%
- ✅ Page load time: < 2 seconds
- ✅ OTP delivery: < 30 seconds
- ✅ Zero critical errors
- ✅ First 10 supplier signups
- ✅ First 5 RFQs created

---

## 💬 AUTOMATED DEPLOYMENT STATUS

**Run This to Check Everything:**

```bash
# Complete status check
cat << 'EOF' > ~/bell24h/check-status.sh
#!/bin/bash
echo "=== BELL24h Status Check ==="
echo ""
echo "Container Status:"
docker ps --filter "name=bell24h" --format "table {{.Names}}\t{{.Status}}"
echo ""
echo "Health Check:"
curl -s http://localhost/api/health | jq . || curl -s http://localhost/api/health
echo ""
echo "Recent Logs:"
docker logs --tail 5 bell24h
echo ""
echo "Disk Space:"
df -h / | tail -1
echo ""
echo "Memory Usage:"
free -h | head -2
EOF

chmod +x ~/bell24h/check-status.sh
~/bell24h/check-status.sh
```

---

## ✅ FINAL CHECKLIST BEFORE LAUNCH

**Must Have (100%):**
- [x] Container running
- [ ] 502 error fixed
- [ ] DNS configured
- [ ] HTTPS working
- [ ] Health check passing
- [ ] Login page working
- [ ] Database connected
- [ ] Environment variables set

**Should Have (80%):**
- [ ] OTP SMS working
- [ ] n8n workflows active
- [ ] At least Workflow A built
- [ ] All pages load correctly
- [ ] No critical errors

**Nice to Have (60%):**
- [ ] Workflow B built
- [ ] Analytics tracking
- [ ] Error monitoring
- [ ] Backup system

---

**You're 95% there! Run the automated fix script now and you'll be launch-ready by Nov 20!** 🚀

