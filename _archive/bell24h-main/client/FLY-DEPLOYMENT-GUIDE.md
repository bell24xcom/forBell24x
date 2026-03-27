# 🚀 Fly.io Deployment Guide for BELL24h

## ✅ What Has Been Automated

1. ✓ **fly.toml** - Configuration file created
2. ✓ **Dockerfile** - Production-ready Docker image
3. ✓ **deploy-fly.ps1** - Automated deployment script
4. ✓ **next.config.js** - Updated for standalone output
5. ✓ **Git proxy settings** - Reset to fix GitHub connectivity

---

## 📋 Step-by-Step Deployment (Manual Steps Required)

### **Step 1: Install Fly.io CLI (One-Time Setup)**

**Run PowerShell as Administrator:**

```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Close and reopen PowerShell** (to refresh PATH), then verify:

```powershell
fly version
```

You should see: `flyctl v0.x.x`

---

### **Step 2: Login to Fly.io**

```powershell
cd C:\Users\Sanika\Projects\bell24h\client
fly auth login
```

This opens a browser - **sign in with the same account that received the Fly.io welcome email**.

---

### **Step 3: Set Environment Variables (Secrets)**

**You need to set these secrets in Fly.io. Get values from your `.env.production` file:**

```powershell
# Replace with your actual values
fly secrets set DATABASE_URL="postgresql://user:password@ep-xxx.ap-south-1.aws.neon.tech/db?sslmode=require"
fly secrets set NEXT_PUBLIC_APP_URL="https://bell24h.fly.dev"
fly secrets set MSG91_API_KEY="your-msg91-key"
fly secrets set MSG91_SENDER_ID="BELL24"
```

**To see all current secrets:**
```powershell
fly secrets list
```

---

### **Step 4: Launch App (First Time Only)**

```powershell
fly launch --name bell24h --region bom --no-deploy
```

**When prompted:**
- Copy configuration from existing app? → **N**
- Set up PostgreSQL database? → **N** (you have Neon)
- Deploy now? → **N** (secrets are already set)

---

### **Step 5: Deploy**

**Option A: Use the automated script:**
```powershell
.\deploy-fly.ps1
```

**Option B: Manual deploy:**
```powershell
fly deploy
```

**Wait 3-5 minutes** - you'll see build logs and "Deployment successful" message.

---

### **Step 6: Test Your Live Site**

```powershell
fly open
```

Or visit: **https://bell24h.fly.dev**

---

### **Step 7: Update DNS in Cloudflare**

1. Go to [Cloudflare DNS Dashboard](https://dash.cloudflare.com/)
2. **Delete:**
   - `CNAME @` → bell24h.pages.dev
   - `CNAME www` → bell24h.pages.dev
3. **Add:**
   - `CNAME @` → **bell24h.fly.dev** (Proxy: ON, Orange cloud)
   - `CNAME www` → **bell24h.fly.dev** (Proxy: ON, Orange cloud)
4. **Keep:**
   - `A n8n` → 80.225.192.248 (for Oracle VM)
   - `CNAME app` → n8n.bell24h.com

**Wait 2-10 minutes** for DNS propagation, then visit: **https://bell24h.com**

---

## 🔧 Troubleshooting

### **Fly CLI Not Found**
- Make sure you ran installation as **Administrator**
- **Close and reopen PowerShell** after installation
- Check PATH: `$env:PATH -split ';' | Select-String "fly"`

### **Deployment Fails**
- Check logs: `fly logs`
- Verify secrets: `fly secrets list`
- Check app status: `fly status`

### **Database Connection Issues**
- Verify `DATABASE_URL` secret is set correctly
- Test connection: `fly ssh console -C "node -e \"console.log(process.env.DATABASE_URL)\""`

### **Build Errors**
- Check Dockerfile syntax
- Verify `next.config.js` has `output: 'standalone'`
- Check build logs: `fly logs`

---

## 📊 Post-Deployment Checklist

- [ ] Site loads at https://bell24h.fly.dev
- [ ] Database connection works (test a page that uses Prisma)
- [ ] Environment variables are set correctly
- [ ] DNS updated in Cloudflare
- [ ] https://bell24h.com works (after DNS propagation)
- [ ] All features tested (login, supplier pages, etc.)

---

## 🎯 Next Steps After Deployment

1. **Test all features** on the live site
2. **Monitor logs:** `fly logs` (or `fly logs -a bell24h`)
3. **Scale if needed:** `fly scale count 2` (for more instances)
4. **Set up monitoring:** Use Fly.io dashboard for metrics

---

## 💰 Cost Information

- **Free tier:** 3 shared vCPU, 256MB RAM, 3GB storage
- **Paid tier (when you scale):** Starts at ~₹1,500/month
- **Your current usage:** ₹0 (free tier covers MVP)

---

## 🆘 Need Help?

- **Fly.io Support:** Use the Support portal in your dashboard (30-day free trial)
- **Check logs:** `fly logs -a bell24h`
- **App status:** `fly status -a bell24h`
- **SSH into app:** `fly ssh console -a bell24h`

---

**Your empire is ready to deploy! 🚀**

