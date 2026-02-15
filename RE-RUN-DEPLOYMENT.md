# Re-run Deployment - Quick Guide

## ✅ **Secret Added Successfully!**

Your `ORACLE_SSH_KEY` secret is now configured in GitHub.

---

## 🚀 **Step 1: Re-run the Failed Workflow**

### **Option A: Re-run from Actions Page (Recommended)**

1. **Go to GitHub Actions**:
   - Visit: `https://github.com/digitex-erp/bell24h/actions`

2. **Find the Failed Workflow**:
   - Look for: **"Deploy Bell24H to Oracle VM"** #192
   - Status: ❌ **Failure** (red X)

3. **Click on the Failed Run**:
   - Click on the workflow run to open details

4. **Re-run the Workflow**:
   - Click **"Re-run all jobs"** button (top right, next to "Cancel workflow")
   - Or click the **"Re-run jobs"** dropdown → **"Re-run all jobs"**

5. **Monitor Progress**:
   - Watch the deployment logs in real-time
   - Should complete in 3-5 minutes

---

### **Option B: Manual Trigger**

1. **Go to Workflows**:
   - Visit: `https://github.com/digitex-erp/bell24h/actions/workflows/deploy.yml`

2. **Run Workflow**:
   - Click **"Run workflow"** button (top right)
   - Select branch: `main`
   - Click **"Run workflow"**

---

## ⏱️ **What to Expect**

### **Deployment Timeline:**
- **0-30s**: Checkout code
- **30-40s**: Setup SSH
- **40-50s**: Connect to VM
- **50s-3min**: Git pull + Docker build
- **3-4min**: Container start
- **4-5min**: Health check + Nginx reload
- **5min**: ✅ Success!

---

## 🔍 **Monitor Deployment**

### **Watch Real-Time Logs:**

1. **GitHub Actions Dashboard**:
   - URL: `https://github.com/digitex-erp/bell24h/actions`
   - Shows: Live deployment progress
   - Updates: Every few seconds

2. **What to Look For:**
   - ✅ Green checkmarks = Success
   - 🟡 Yellow circle = In progress
   - ❌ Red X = Failed (check logs)

---

## ✅ **After Deployment Succeeds**

### **Verify Your Site:**

1. **Check Live Sites**:
   - https://bell24h.com
   - https://www.bell24h.com
   - https://app.bell24h.com

2. **Verify Hero Section**:
   - Hero section should be **fully visible**
   - Heading in **solid white** (no gradient)
   - No empty dark blue space

3. **Verify SEO**:
   - Right-click → **View Page Source**
   - Search for: `"application/ld+json"` (should find 3 instances)
   - Check `<title>` tag for SEO-optimized title

---

## 🎯 **Success Indicators**

When deployment completes successfully, you'll see:

- ✅ **Green checkmark** in GitHub Actions
- ✅ **"Deployment completed successfully!"** message
- ✅ **Site loads** at https://bell24h.com
- ✅ **Hero section visible** with all content
- ✅ **No errors** in browser console

---

## 🛠️ **If Deployment Still Fails**

### **Common Issues:**

1. **"Permission denied"**:
   - Verify secret name is exactly: `ORACLE_SSH_KEY`
   - Check if key was copied completely (including BEGIN/END lines)

2. **"Connection refused"**:
   - Check if VM is running in Oracle Cloud
   - Verify IP: `80.225.192.248`

3. **"Docker build failed"**:
   - Check GitHub Actions logs for specific error
   - Verify Dockerfile syntax

---

**Status**: ✅ **Secret Configured - Ready to Deploy!**

Go ahead and re-run the workflow now! 🚀

