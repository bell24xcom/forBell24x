# Fix GitHub Secret - Quick Setup Guide

## ❌ **Error: SSH Key Secret Not Configured**

The deployment failed because the `ORACLE_SSH_KEY` secret is missing from GitHub.

---

## 🔐 **Step-by-Step: Add SSH Key Secret**

### **Step 1: Get Your SSH Private Key**

**Option A: Using PowerShell**
```powershell
Get-Content "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key"
```

**Option B: Using Notepad**
1. Open File Explorer
2. Navigate to: `C:\Users\Sanika\Downloads\oracle-ssh-bell\`
3. Open: `ssh-key-2025-10-01.key` with Notepad
4. **Copy the ENTIRE contents** (including the BEGIN and END lines)

**The key should look like this:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
... (many lines of encoded text) ...
-----END OPENSSH PRIVATE KEY-----
```

---

### **Step 2: Add Secret to GitHub**

1. **Go to Your Repository**:
   - Visit: `https://github.com/digitex-erp/bell24h`

2. **Navigate to Secrets**:
   - Click **Settings** (top menu)
   - Click **Secrets and variables** → **Actions** (left sidebar)

3. **Add New Secret**:
   - Click **"New repository secret"** button (top right)

4. **Fill in the Form**:
   - **Name**: `ORACLE_SSH_KEY`
   - **Secret**: Paste your **entire SSH private key** (from Step 1)
   - Click **"Add secret"**

---

### **Step 3: Verify Secret Was Added**

You should now see:
- ✅ Secret name: `ORACLE_SSH_KEY`
- ✅ Status: Configured
- ✅ Last updated: Just now

---

### **Step 4: Re-run the Deployment**

**Option A: Re-run Failed Workflow**
1. Go to: `https://github.com/digitex-erp/bell24h/actions`
2. Click on the failed workflow run
3. Click **"Re-run all jobs"** button (top right)

**Option B: Push a New Commit** (triggers automatically)
```bash
# Make a small change or just re-commit
git commit --allow-empty -m "Trigger deployment after adding SSH secret"
git push origin main
```

**Option C: Manual Trigger**
1. Go to: `https://github.com/digitex-erp/bell24h/actions`
2. Click **"Deploy Bell24H to Oracle VM"** workflow
3. Click **"Run workflow"** button (top right)
4. Select branch: `main`
5. Click **"Run workflow"**

---

## ✅ **Quick Checklist**

- [ ] SSH key file opened (`ssh-key-2025-10-01.key`)
- [ ] **Entire** key copied (including BEGIN/END lines)
- [ ] GitHub repository opened (`digitex-erp/bell24h`)
- [ ] Settings → Secrets and variables → Actions
- [ ] New repository secret created
- [ ] Name: `ORACLE_SSH_KEY`
- [ ] Secret pasted
- [ ] Secret saved
- [ ] Workflow re-run or new push triggered

---

## 🎯 **After Adding Secret**

Once you've added the secret:

1. **Re-run the workflow** (see Step 4 above)
2. **Monitor deployment** at: `https://github.com/digitex-erp/bell24h/actions`
3. **Wait 3-5 minutes** for deployment to complete
4. **Verify site** at: `https://bell24h.com`

---

## ⚠️ **Important Notes**

- **Never share your private key publicly**
- The secret is encrypted by GitHub
- Only GitHub Actions can access it
- You can update it anytime in Settings

---

## 🛠️ **Troubleshooting**

### **If Secret Still Doesn't Work:**

1. **Verify Secret Name**:
   - Must be exactly: `ORACLE_SSH_KEY` (case-sensitive)
   - Check in workflow file: `.github/workflows/deploy.yml` line 18

2. **Verify Key Format**:
   - Must include `-----BEGIN OPENSSH PRIVATE KEY-----`
   - Must include `-----END OPENSSH PRIVATE KEY-----`
   - No extra spaces or characters

3. **Check Key Permissions** (on VM):
   ```bash
   ssh ubuntu@80.225.192.248
   # If this works, the key is correct
   ```

---

**Once the secret is added, the deployment will work automatically!** 🚀

