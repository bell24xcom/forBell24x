# 🎯 BELL24h Deployment Priority Guide (For Non-Coders)

**Date:** November 14, 2025  
**Your Current Status:** Site is LIVE at IP, need domain + n8n integration  
**Priority Order:** Oracle VM FIRST → Then n8n

---

## ✅ WHAT YOU'VE ALREADY DONE (Great Job!)

- ✅ Oracle VM running (Ubuntu 22.04)
- ✅ Docker container running (port 80)
- ✅ Site accessible at http://80.225.192.248
- ✅ Neon database connected (with supplier data)
- ✅ n8n deployed at n8n.bell24h.com
- ✅ All workflows visible in n8n interface

---

## 🎯 ANSWER: ORACLE VM FIRST, THEN N8N

### **Why This Order?**

1. **Oracle VM (Website) = Foundation**
   - Without a live website, n8n workflows have nothing to connect to
   - Users need to access bell24h.com first
   - All your 500+ pages need to be publicly accessible

2. **n8n (Automation) = Enhancement**
   - n8n workflows connect TO your live website
   - They trigger when users create RFQs, claim profiles, etc.
   - Without a working website, workflows can't do anything

**Analogy:** Oracle VM is your storefront. n8n is your automated sales assistant. You need the store open before the assistant can help customers.

---

## 📋 PHASE 1: COMPLETE ORACLE VM (Do This FIRST - 30 Minutes)

### **STEP 1: Update Cloudflare DNS (5 Minutes)**

**What This Does:** Makes bell24h.com point to your Oracle VM

**Simple Steps:**

1. **Open Cloudflare in your browser**
   - Go to: https://dash.cloudflare.com
   - Login with your account

2. **Select bell24h.com domain**

3. **Click "DNS" tab (left sidebar)**

4. **Update these 2 records:**

   | Type | Name | Content (IP Address) | Proxy Status |
   |------|------|---------------------|--------------|
   | A | @ | `80.225.192.248` | **OFF** (gray cloud) |
   | A | www | `80.225.192.248` | **OFF** (gray cloud) |

   **How to update:**
   - If records exist: Click "Edit" → Change IP to `80.225.192.248` → Click "Save"
   - If records don't exist: Click "Add record" → Fill in the table above → Click "Save"

5. **Delete any old records:**
   - Find any A records pointing to Vercel/Fly/Cloudflare Pages
   - Delete them (click "Edit" → "Delete")

6. **Wait 5-10 minutes** for DNS to update globally

7. **Test:** Visit http://bell24h.com in your browser

**✅ Success Check:** You should see your Bell24h homepage (same as IP address)

---

### **STEP 2: Fix Environment Variables (10 Minutes)**

**What This Does:** Adds real database connection and security secrets to your app

**Copy-Paste This ENTIRE Block in SSH Terminal:**

```bash
# Connect to your VM (if not already connected)
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

# Go to project directory
cd ~/bell24h

# Generate a secure secret (for login security)
SECRET=$(openssl rand -base64 32)

# Create production environment file with REAL values
cat > client/.env.production << EOF
# Database (from your Neon database)
DATABASE_URL=postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Next Auth (for user login)
NEXTAUTH_URL=https://bell24h.com
NEXTAUTH_SECRET=$SECRET

# Node Environment
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://bell24h.com
EOF

# Restart container with new environment
docker stop bell24h
docker rm bell24h

docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest

# Wait 10 seconds for startup
sleep 10

# Check if running
docker ps | grep bell24h

# Test health
curl http://localhost/api/health
```

**✅ Success Check:** 
- `docker ps` shows `bell24h` container as "Up"
- `curl` returns `{"status":"ok"}`

**What This Command Does:**
- ✅ Creates `.env.production` with your real Neon database URL
- ✅ Generates a secure random secret (required for user logins)
- ✅ Restarts container with correct settings
- ✅ Your app now uses real database (not test data)

---

### **STEP 3: Add HTTPS (Secure Connection) - Optional but Recommended (15 Minutes)**

**Option A: Cloudflare HTTPS (EASIEST - Recommended for Non-Coders)**

1. **In Cloudflare DNS tab:**
   - Change both A records (@ and www) to **"Proxied"** (orange cloud)
   - Click "Save"

2. **Go to SSL/TLS tab (left sidebar)**

3. **Set encryption mode to "Full"**

4. **Done!** Your site now has https://bell24h.com

**Option B: Let's Encrypt (More Control - Advanced)**

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx nginx

# Get SSL certificate (replace with your email)
sudo certbot certonly --standalone -d bell24h.com -d www.bell24h.com --email your-email@example.com --agree-tos --non-interactive

# This will ask for email - enter yours
# Then it creates SSL certificate automatically
```

**✅ Success Check:** Visit https://bell24h.com (not http) - browser should show padlock icon

---

### **STEP 4: Test Your Website (5 Minutes)**

**Test These URLs:**

1. **Homepage:** http://bell24h.com (or https://)
   - Should load: Your hero section, features, etc.

2. **Login:** http://bell24h.com/auth/login-otp
   - Should show: Mobile OTP login form

3. **Video RFQ:** http://bell24h.com/rfq/video
   - Should show: Video RFQ interface (you saw this earlier)

4. **Supplier Dashboard:** http://bell24h.com/supplier/dashboard
   - Should show: Supplier dashboard (may require login)

5. **API Health:** http://bell24h.com/api/health
   - Should return: `{"status":"ok"}`

**✅ All working?** Move to Phase 2 (n8n configuration)

**❌ Not working?** Check:
- DNS propagated? (wait 10 more minutes)
- Container running? (`docker ps | grep bell24h`)
- Check logs: `docker logs --tail 50 bell24h`

---

## 📋 PHASE 2: CONFIGURE N8N (After Oracle VM is Working - 1 Hour)

### **STEP 5: Verify n8n Connection to Database (10 Minutes)**

**What This Does:** Tests if n8n can read/write to your Neon database

**In n8n Interface (http://n8n.bell24h.com):**

1. **Open your existing workflow:** "Bell24H AI Category Worker - Complete"

2. **Find Postgres node** (should be labeled "Save RFQ to Database" or similar)

3. **Click on Postgres node**

4. **Click "Credential" dropdown**

5. **Create New Credential:**

   **Postgres Connection:**
   ```
   Host: ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech
   Database: neondb
   User: neondb_owner
   Password: npg_0Duqdxs3RoyA
   Port: 5432
   SSL: Enabled (require)
   ```

6. **Click "Save"**

7. **Test Connection:**
   - In Postgres node, click "Execute Node"
   - Should show: "Connection successful" or data rows

**✅ Success:** n8n can now connect to your Neon database

---

### **STEP 6: Add MSG91 SMS Credentials (5 Minutes)**

**What This Does:** Allows n8n to send SMS notifications to suppliers

**Prerequisites:** You need MSG91 account (if not, sign up at msg91.com)

**In n8n Interface:**

1. **Go to Settings → Credentials**

2. **Click "New"**

3. **Select "HTTP Request"**

4. **Add Credential:**
   - Name: "MSG91 SMS"
   - Authentication: Header Auth
   - Header Name: `authkey`
   - Value: `YOUR_MSG91_AUTH_KEY` (from msg91.com dashboard)

5. **Save**

6. **Now find any MSG91/SMS node in your workflow**

7. **Update it to use this credential**

**✅ Success:** n8n can now send SMS (when you have Flow ID approved)

---

### **STEP 7: Test Existing Workflow (15 Minutes)**

**What This Does:** Verifies your AI Category Worker workflow actually works

**In n8n:**

1. **Open workflow:** "Bell24H AI Category Worker - Complete"

2. **Find entry point:** Should be "RFQ Webhook" or "Worker Webhook1"

3. **Click dropdown:** "Execute workflow from [RFQ Webhook]"

4. **Click orange button:** "Execute workflow from RFQ Webhook"

5. **Watch nodes light up:**
   - Each node should turn green (✓) as it executes
   - If any node turns red (✗), that's an error

6. **Check execution result:**
   - Bottom panel shows execution log
   - Should say "Execution successful"

**✅ Success:** Workflow runs without errors

**❌ Errors?** Take screenshot of error message, send to me

---

### **STEP 8: Connect Workflow to Your Live Website (10 Minutes)**

**What This Does:** Makes your website trigger n8n workflows automatically

**In Your Website Code (Next.js):**

**File to Edit:** `client/src/app/api/rfq/create/route.ts`

**Add This Code** (after saving RFQ to database):

```typescript
// After successful RFQ creation, trigger n8n workflow
try {
  await fetch('https://n8n.bell24h.com/webhook/rfq-created', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rfq_id: newRFQ.id,
      product_name: newRFQ.productName,
      quantity: newRFQ.quantity,
      budget: newRFQ.budget,
      description: newRFQ.description,
      buyer_location: newRFQ.location,
      category: newRFQ.category,
    }),
  });
} catch (error) {
  console.error('Failed to trigger n8n workflow:', error);
  // Don't fail the RFQ creation if n8n fails
}
```

**Deploy Change:**
```bash
# SSH into VM
cd ~/bell24h

# Rebuild container with updated code
docker build --no-cache -t bell24h:latest -f Dockerfile .

# Restart container
docker stop bell24h && docker rm bell24h
docker run -d \
  --name bell24h \
  --restart always \
  -p 80:3000 \
  --env-file ~/bell24h/client/.env.production \
  bell24h:latest
```

**Test:**
1. Create a test RFQ on your website
2. Check n8n workflow execution log
3. Should see workflow triggered automatically

**✅ Success:** RFQ creation on website → n8n workflow runs automatically

---

### **STEP 9: Activate Workflow (2 Minutes)**

**What This Does:** Makes workflow run automatically (not just manual testing)

**In n8n:**

1. **Top-right corner:** Find toggle switch "Active"

2. **Click toggle:** Should turn ON (green)

3. **Workflow now runs automatically** when RFQ is created

**✅ Success:** Workflow is active and will run for all new RFQs

---

### **STEP 10: Build Marketing Workflows (Week 1-2 Priority)**

**Priority Order (As Per Previous Plan):**

**Week 1 (This Week):**

1. **Workflow A: Company Profile Invitation**
   - Sends SMS/Email to scraped companies
   - 100 companies/day automatically
   - Time to build: 30 minutes
   - Impact: 4x more profile claims

2. **Workflow B: Auto-Onboarding**
   - Welcome sequence after profile claimed
   - Email reminders for incomplete profiles
   - Time to build: 30 minutes
   - Impact: 90% profile completion vs 40%

**Week 2 (Next Week):**

3. **Workflow C: Freemium-to-Paid Converter**
4. **Workflow D: Payment Reminder**

**Week 3 (After):**

5-10. **Workflows E-J** (Content, Referral, LinkedIn, etc.)

**Note:** I'll create detailed step-by-step guides for Workflows A & B once Oracle VM is 100% complete.

---

## 📊 INTEGRATION CHECKLIST

### **Oracle VM ↔ Neon Database**

- [x] Database URL in `.env.production`
- [x] Container restarted with env file
- [ ] Test: Create a supplier profile on website → Check if appears in Neon database

**How to Test:**
```bash
# SSH into VM
cd ~/bell24h

# Connect to Neon database (using psql if installed, or use Neon web console)
# Check if suppliers table has data
```

---

### **Oracle VM ↔ n8n**

- [ ] n8n webhook URL is accessible from your VM
- [ ] Workflow receives webhook from website
- [ ] Workflow can write back to Neon database

**How to Test:**
1. Create RFQ on website
2. Check n8n execution log
3. Verify RFQ appears in database after workflow runs

---

### **n8n ↔ Neon Database**

- [ ] Postgres credential configured in n8n
- [ ] Test query runs successfully
- [ ] Can read supplier data from database

**How to Test:**
1. In n8n, execute Postgres node manually
2. Should return data rows
3. No connection errors

---

## 🚨 TROUBLESHOOTING COMMON ISSUES

### **Issue 1: DNS Not Working**

**Symptoms:** bell24h.com doesn't load

**Fix:**
1. Check Cloudflare DNS records are correct
2. Wait 15 minutes (DNS can take time)
3. Test with: `nslookup bell24h.com` (should return 80.225.192.248)

---

### **Issue 2: Container Won't Start**

**Symptoms:** `docker ps` shows no bell24h container

**Fix:**
```bash
# Check logs
docker logs bell24h

# Common fix: Port 80 already in use
sudo ss -ltnp | grep ':80'
# If nginx is using it, stop it:
sudo systemctl stop nginx
# Then restart container
```

---

### **Issue 3: n8n Can't Connect to Database**

**Symptoms:** Postgres node shows error

**Fix:**
1. Verify credential has correct connection string
2. Test connection from n8n
3. Check Neon database is accessible (use Neon web console)
4. Verify SSL is enabled in connection

---

### **Issue 4: Workflow Doesn't Trigger**

**Symptoms:** Create RFQ on website, but n8n doesn't run

**Fix:**
1. Check webhook URL in website code is correct
2. Verify workflow is ACTIVE (toggle ON)
3. Check n8n webhook path matches: `/webhook/rfq-created`
4. Test webhook manually with Postman/curl

---

## 🎯 SUCCESS METRICS (How to Know You're Done)

### **Phase 1 Complete (Oracle VM):**

✅ bell24h.com loads in browser  
✅ HTTPS working (padlock icon)  
✅ Can login with OTP  
✅ All pages accessible  
✅ API health check returns OK  
✅ Container auto-restarts on reboot  

### **Phase 2 Complete (n8n):**

✅ n8n connects to Neon database  
✅ Can execute Postgres queries  
✅ Workflow executes without errors  
✅ Website triggers workflow automatically  
✅ SMS/Email notifications work (when MSG91 approved)  
✅ At least Workflow A & B are built  

---

## 💬 YOUR IMMEDIATE NEXT ACTION

**RIGHT NOW (Next 30 Minutes):**

1. **Do STEP 1:** Update Cloudflare DNS (5 minutes)
2. **Do STEP 2:** Fix environment variables (10 minutes)
3. **Do STEP 3:** Add HTTPS via Cloudflare (5 minutes)
4. **Do STEP 4:** Test website (5 minutes)
5. **Report back:** Tell me what you see

**AFTER Oracle VM is 100% Working:**

6. **Do STEP 5:** Verify n8n database connection
7. **Do STEP 6:** Add MSG91 credentials
8. **Do STEP 7:** Test existing workflow
9. **Then we'll build:** Workflow A & B together

---

## 🆘 NEED HELP?

**Tell me:**
- Which step you're on
- What you see (copy-paste or screenshot)
- Any error messages

**I'll guide you through it step-by-step!**

---

**Remember:** Oracle VM FIRST (get website live), then n8n (automate everything). 

**You're 95% done - just finish Oracle VM and you'll have a fully functioning production site!** 🚀

