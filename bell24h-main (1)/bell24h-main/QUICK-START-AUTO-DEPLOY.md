# ⚡ **QUICK START — AUTO-DEPLOY IN 5 MINUTES**

## **NON-CODER FRIENDLY — COPY-PASTE ONLY**

---

## **STEP 1: CREATE GITHUB REPO (1 MINUTE)**

1. Go: [https://github.com/new](https://github.com/new)
2. Name: `bell24h`
3. Click **Create repository**

---

## **STEP 2: PUSH CODE (2 MINUTES)**

**Open PowerShell:**

```powershell
cd "C:\Users\Sanika\Projects\bell24h"

# Initialize git
git init
git add .
git commit -m "Bell24H Auto-Deploy Ready"

# Add GitHub remote (REPLACE YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/bell24h.git

# Push
git branch -M main
git push -u origin main
```

**When asked for password:** Use GitHub Personal Access Token
- Create at: [https://github.com/settings/tokens](https://github.com/settings/tokens)
- Select scope: ✅ `repo`

---

## **STEP 3: SETUP GITHUB SECRET (1 MINUTE)**

1. Go: `https://github.com/YOUR_USERNAME/bell24h/settings/secrets/actions`
2. Click **New repository secret**
3. **Name**: `ORACLE_SSH_KEY`
4. **Value**: Copy entire content of:
   ```
   C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key
   ```
5. Click **Add secret**

---

## **STEP 4: ENSURE .env.production ON VM (1 MINUTE)**

```powershell
scp -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" `
    "C:\Users\Sanika\Projects\bell24h\client\.env.production" `
    ubuntu@80.225.192.248:~/bell24h/client/.env.production
```

---

## **STEP 5: TEST AUTO-DEPLOY**

1. Make a small change (e.g., edit a comment in any file)
2. Push:

```powershell
git add .
git commit -m "Test auto-deploy"
git push
```

3. Go to: `https://github.com/YOUR_USERNAME/bell24h/actions`
4. Watch the deployment run (takes 2-3 minutes)
5. Check: `http://80.225.192.248` → **YOUR CHANGE IS LIVE!**

---

## **✅ DONE!**

**Every `git push` = Auto-deploy in 2-3 minutes**

**No SSH. No manual commands. Fully automated.**

---

## **📖 FULL GUIDE**

See `GITHUB-ORACLE-AUTO-DEPLOY-GUIDE.md` for detailed instructions.

---

**🎉 YOU ARE NOW A DEVOPS MASTER!**

