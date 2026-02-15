# GitHub Actions Auto-Deployment Setup Guide

## ✅ **Workflow Updated**

Your `.github/workflows/deploy.yml` has been updated and is ready for auto-deployment!

**Changes Made:**
- ✅ Fixed port mapping: `3000:3000` (Nginx handles port 80)
- ✅ Updated health check to use port 3000
- ✅ Added Nginx verification step
- ✅ Updated deployment status messages

---

## 🔐 **Step 1: Add GitHub Secret (SSH Key)**

You need to add your SSH private key as a GitHub secret:

### **1.1. Get Your SSH Private Key**

On your local machine, open the SSH key file:

**Windows (PowerShell):**
```powershell
Get-Content "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key"
```

**Or use Notepad:**
- Open: `C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key`
- Copy the **entire contents** (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

---

### **1.2. Add Secret to GitHub**

1. **Go to your GitHub repository**: `https://github.com/digitex-erp/bell24h`

2. **Navigate to Settings**:
   - Click **Settings** (top menu)
   - Click **Secrets and variables** → **Actions** (left sidebar)

3. **Add New Secret**:
   - Click **New repository secret**
   - **Name**: `ORACLE_SSH_KEY`
   - **Secret**: Paste your entire SSH private key (from step 1.1)
   - Click **Add secret**

---

## 🚀 **Step 2: Push Changes to Trigger Deployment**

Once the secret is added, push your changes:

```bash
# In your local project directory
cd C:\Users\Sanika\Projects\bell24h

# Add all changes
git add .

# Commit changes
git commit -m "Add SEO metadata and fix hero section visibility"

# Push to main branch (this triggers auto-deployment)
git push origin main
```

---

## 📊 **Step 3: Monitor Deployment**

### **View Deployment Progress**

1. **Go to GitHub Actions**:
   - Visit: `https://github.com/digitex-erp/bell24h/actions`

2. **Check Workflow Run**:
   - You'll see a new workflow run: "Deploy Bell24H to Oracle VM"
   - Click on it to see real-time logs

3. **Watch for Success**:
   - ✅ Green checkmark = Deployment successful
   - ❌ Red X = Deployment failed (check logs)

---

## 🔍 **Step 4: Verify Deployment**

After deployment completes (usually 3-5 minutes):

1. **Check Your Sites**:
   - https://bell24h.com
   - https://www.bell24h.com
   - https://app.bell24h.com

2. **Verify Hero Section**:
   - Hero section should be visible
   - No empty dark blue space

3. **Check SEO**:
   - Right-click → View Page Source
   - Search for: `"application/ld+json"` (should find 3 instances)
   - Check `<title>` tag has SEO-optimized title

---

## 🛠️ **Troubleshooting**

### **If Deployment Fails:**

1. **Check GitHub Actions Logs**:
   - Go to Actions tab
   - Click on failed workflow
   - Scroll to error message

2. **Common Issues**:

   **Issue**: "Permission denied (publickey)"
   - **Fix**: Verify `ORACLE_SSH_KEY secret is correct
   - Make sure you copied the **entire** private key including headers

   **Issue**: "Connection refused"
   - **Fix**: Check if VM is accessible
   - SSH manually: `ssh -i "path/to/key" ubuntu@80.225.192.248`

   **Issue**: "Docker build failed"
   - **Fix**: Check Dockerfile syntax
   - Verify all dependencies are in package.json

   **Issue**: "Port already in use"
   - **Fix**: The old container might still be running
   - The workflow should handle this, but if it persists:
     ```bash
     ssh ubuntu@80.225.192.248
     docker stop bell24h
     docker rm bell24h
     ```

---

## 📋 **Manual Trigger (If Needed)**

You can also trigger deployment manually:

1. Go to: `https://github.com/digitex-erp/bell24h/actions`
2. Click on **"Deploy Bell24H to Oracle VM"** workflow
3. Click **"Run workflow"** button (top right)
4. Select branch: `main`
5. Click **"Run workflow"**

---

## 🔄 **How It Works**

1. **Push to `main` branch** → Triggers workflow
2. **GitHub Actions** → Checks out code
3. **SSH Setup** → Uses `ORACLE_SSH_KEY` secret
4. **Connect to VM** → SSH into Oracle Cloud VM
5. **Pull Latest Code** → Git pull from repository
6. **Stop Old Container** → `docker stop bell24h`
7. **Build New Image** → `docker build`
8. **Start New Container** → `docker run` on port 3000
9. **Health Check** → Verify app is running
10. **Reload Nginx** → Ensure proxy is working
11. **Done!** → Your site is live with latest changes

---

## ✅ **Checklist**

Before pushing:

- [ ] SSH key added to GitHub Secrets as `ORACLE_SSH_KEY`
- [ ] All code changes committed
- [ ] Ready to push to `main` branch

After pushing:

- [ ] GitHub Actions workflow started
- [ ] Deployment completed successfully (green checkmark)
- [ ] Site is live at https://bell24h.com
- [ ] Hero section visible
- [ ] SEO metadata visible in page source

---

## 🎯 **Next Steps After Deployment**

1. **Test Hero Section**: Verify it's visible and properly styled
2. **Test SEO**: Use Google Rich Results Test
3. **Create OG Image**: Add `/public/og-image.jpg` (1200x630px)
4. **Update Social Links**: Update `sameAs` URLs in `page.tsx`
5. **Submit to Google**: Add site to Google Search Console

---

**Status**: ✅ **Ready to Deploy!**

Add the GitHub secret, then push your changes to trigger auto-deployment! 🚀

