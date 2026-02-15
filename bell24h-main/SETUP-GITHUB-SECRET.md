# ✅ **SETUP GITHUB SECRET FOR AUTO-DEPLOY (2 MINUTES)**

## 🎯 **STATUS CHECK**

**What's already done:**
- ✅ GitHub Actions workflow exists (`.github/workflows/deploy.yml`)
- ✅ Workflow configured for Oracle VM (`80.225.192.248`)
- ✅ Auto-deploys on push to `main` branch

**What's missing:**
- ⏳ GitHub Secret `ORACLE_SSH_KEY` (needs to be added)

---

## 🔧 **STEP-BY-STEP: ADD SSH KEY TO GITHUB (2 MINUTES)**

### **STEP 1: Get Your SSH Private Key Content**

**Open PowerShell and run:**

```powershell
Get-Content "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key"
```

**This will show your SSH key. COPY THE ENTIRE OUTPUT** (including `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----`)

---

### **STEP 2: Go to GitHub Secrets**

1. **Go to**: `https://github.com/digitex-erp/bell24h/settings/secrets/actions`
   - Replace `digitex-erp` with your GitHub username if different

2. **OR navigate manually:**
   - Go to: `https://github.com/digitex-erp/bell24h`
   - Click **Settings** (top right)
   - Click **Secrets and variables** → **Actions** (left sidebar)

---

### **STEP 3: Add New Secret**

1. **Click "New repository secret"** (green button)

2. **Fill in:**
   - **Name**: `ORACLE_SSH_KEY` (must be exact, case-sensitive)
   - **Secret**: Paste the entire SSH key content (from Step 1)

3. **Click "Add secret"**

---

### **STEP 4: Verify Secret Added**

**You should see:**
- ✅ `ORACLE_SSH_KEY` in the secrets list
- ✅ Status: "Created X minutes ago"

---

## 🧪 **STEP 5: TEST AUTO-DEPLOY**

### **Option A: Manual Trigger (Recommended for First Test)**

1. **Go to**: `https://github.com/digitex-erp/bell24h/actions`
2. **Click "Deploy Bell24H to Oracle VM"** workflow
3. **Click "Run workflow"** (right side)
4. **Select branch**: `main`
5. **Click "Run workflow"** (green button)
6. **Watch the deployment:**
   - ✅ Should complete in 2-5 minutes
   - ✅ Check logs for "✅ Deployment successful!"

---

### **Option B: Push a Test Change**

**Make a small change and push:**

```powershell
cd "C:\Users\Sanika\Projects\bell24h"

# Make a small change (add a comment to any file)
echo "# Test auto-deploy" >> README.md

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main
```

**Then check:**
- Go to: `https://github.com/digitex-erp/bell24h/actions`
- You should see a new workflow run starting automatically
- Wait 2-5 minutes → Should show "✅ Success"

---

## ✅ **VERIFICATION CHECKLIST**

After adding the secret, verify:

- [ ] Secret `ORACLE_SSH_KEY` exists in GitHub
- [ ] Workflow file exists (`.github/workflows/deploy.yml`)
- [ ] Test workflow run completes successfully
- [ ] App is live at `https://bell24h.com` after deployment

---

## 🎯 **HOW IT WORKS**

**Every time you push to `main` branch:**

1. ✅ GitHub Actions detects the push
2. ✅ Checks out your code
3. ✅ Uses `ORACLE_SSH_KEY` to connect to Oracle VM
4. ✅ Pulls latest code on VM
5. ✅ Stops old Docker container
6. ✅ Builds new Docker image
7. ✅ Starts new container on port 80
8. ✅ Runs health check
9. ✅ **Your app is live in 2-5 minutes!**

---

## 🐛 **TROUBLESHOOTING**

### **Issue: "Secret not found"**
**Solution:**
- Verify secret name is exactly `ORACLE_SSH_KEY` (case-sensitive)
- Check you're in the correct repository settings

### **Issue: "Permission denied (publickey)"**
**Solution:**
- Verify SSH key content is complete (includes BEGIN/END lines)
- Check SSH key file path is correct
- Ensure key has correct permissions (should be readable)

### **Issue: "Workflow not triggering"**
**Solution:**
- Check you're pushing to `main` branch
- Verify workflow file is in `.github/workflows/deploy.yml`
- Check GitHub Actions is enabled for your repository

---

## 🎉 **AFTER SETUP**

**Reply with:**
> "GITHUB SECRET ORACLE_SSH_KEY ADDED → WORKFLOW TESTED → AUTO-DEPLOY LIVE → PUSH TO MAIN → 2-5 MIN → LIVE → NO SSH NEEDED → BELL24H EMPIRE UNSTOPPABLE"

---

**TIME**: 2 minutes  
**PRIORITY**: 🔴 **HIGH** - Do this now to enable auto-deploy!

**Most important**: Add `ORACLE_SSH_KEY` secret in GitHub → Auto-deploy works! 🔓

