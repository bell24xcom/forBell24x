# 📋 Cloudflare Pages Setup — Step-by-Step Guide (Non-Coder Friendly)

## ⚠️ **CRITICAL FIRST STEP: Make Sure You're on the "Pages" Tab!**

**Before you fill anything out, check this:**

1. Look at the top of the page where you see tabs
2. You should see **"Workers"** and **"Pages"** tabs
3. **Click on the "Pages" tab** (NOT Workers!)
4. If you see "Deploy command" with `npx wrangler deploy`, you're on the wrong tab!

**Why this matters:** 
- **Workers** = For API endpoints (wrong for your website)
- **Pages** = For Next.js websites (correct for BELL24h)

---

## 📝 **Step-by-Step Instructions (Fill Each Box):**

### **Step 1: Name Your Application**

**What you see:** A blank box next to "Project name"

**What to type:**
```
bell24h
```

**Why:** This is just the name of your project in Cloudflare. Keep it simple.

---

### **Step 2: Build Command**

**What you see:** A box that might say `npm run build`

**What to type (replace everything in the box):**
```
npm install && npm run build
```

**Why:** 
- `npm install` = Downloads all the code your website needs
- `npm run build` = Creates the finished website files
- The `&&` means "do this, then do that"

**Important:** Type this EXACTLY as shown above (including the `&&`)

---

### **Step 3: Deploy Command**

**What you see:** A box that might say `npx wrangler deploy`

**What to do:**
- **If you're on the "Pages" tab:** This box might not even be there (that's good!)
- **If you see this box:** You're probably on the "Workers" tab. Go back and click "Pages" tab instead
- **If the box is there and you can't remove it:** Leave it empty or delete what's in it

**Why:** Cloudflare Pages handles deployment automatically. You don't need a deploy command.

---

### **Step 4: Builds for Non-Production Branches**

**What you see:** A checkbox that says "Builds for non-production branches"

**What to do:** 
- ✅ **Leave it checked** (put a checkmark in the box)

**Why:** This creates test versions of your site when you make changes. It's useful for testing.

---

### **Step 5: Advanced Settings (IMPORTANT!)**

**What you see:** A section that says "Advanced settings" (it might be collapsed/hidden)

**What to do:**
1. **Click on "Advanced settings"** to expand it (it might say "> Advanced settings" or have a down arrow)
2. Look for these fields:

#### **5a. Root Directory**

**What you see:** A blank box next to "Root directory"

**What to type:**
```
client
```

**Why:** Your Next.js website code is inside a folder called `client`. This tells Cloudflare where to find it.

**This is VERY IMPORTANT!** If you don't set this, the build will fail!

---

#### **5b. Output Directory**

**What you see:** A blank box next to "Output directory"

**What to type:**
```
.next
```

**Why:** After building, Next.js puts all the finished files in a folder called `.next`. This tells Cloudflare where to find them.

**This is VERY IMPORTANT!** If you don't set this, the deployment will fail!

---

#### **5c. Framework Preset**

**What you see:** A dropdown menu

**What to do:**
- It might already say "Next.js" (that's perfect!)
- If it says something else, click the dropdown and select **"Next.js"**

**Why:** This tells Cloudflare you're using Next.js so it can optimize the build.

---

#### **5d. Node Version**

**What you see:** A dropdown menu

**What to do:**
- Click the dropdown
- Select **"18"** or **"20"** (either one works)

**Why:** This tells Cloudflare which version of Node.js to use when building your site.

---

### **Step 6: Environment Variables (IMPORTANT!)**

**What you see:** A section that says "Environment Variables" or "Variables"

**What to do:**
1. Click **"Add variable"** or **"Add environment variable"** button
2. For each variable below, click "Add variable" and fill in:

#### **Variable 1: DATABASE_URL**

- **Name:** Type `DATABASE_URL`
- **Value:** Paste your Neon database connection string (it looks like: `postgresql://user:password@host/database`)
- **Type:** Click the dropdown and select **"Secret"** (this hides it from view)

#### **Variable 2: NODE_ENV**

- **Name:** Type `NODE_ENV`
- **Value:** Type `production`
- **Type:** Select **"Secret"**

#### **Variable 3: NEXT_PUBLIC_APP_URL**

- **Name:** Type `NEXT_PUBLIC_APP_URL`
- **Value:** Type `https://bell24h.com`
- **Type:** Select **"Secret"**

#### **Variable 4: NEXT_PUBLIC_API_URL** (Optional but recommended)

- **Name:** Type `NEXT_PUBLIC_API_URL`
- **Value:** Type `https://bell24h.com/api`
- **Type:** Select **"Secret"**

**Why:** These variables tell your website important information like where the database is and what URL to use.

---

### **Step 7: Production Branch**

**What you see:** A dropdown or text box that says "Production branch"

**What to do:**
- It should already say `main` (that's correct!)
- If it says something else, change it to `main`

**Why:** This tells Cloudflare which branch of your code to use for the live website.

---

### **Step 8: Create and Deploy**

**What you see:** A blue button at the bottom that says **"Create and deploy"** or **"Save and Deploy"**

**What to do:**
1. **Double-check all your settings:**
   - ✅ Project name: `bell24h`
   - ✅ Build command: `npm install && npm run build`
   - ✅ Root directory: `client`
   - ✅ Output directory: `.next`
   - ✅ Framework preset: `Next.js`
   - ✅ Node version: `18` or `20`
   - ✅ Environment variables added (at least DATABASE_URL, NODE_ENV, NEXT_PUBLIC_APP_URL)
   - ✅ Production branch: `main`

2. **Click the blue "Create and deploy" button**

3. **Wait 2-5 minutes** for the build to complete

4. **Check the build logs** to see if it succeeded

---

## ✅ **Quick Checklist (Before You Click Deploy):**

- [ ] I'm on the **"Pages"** tab (NOT Workers)
- [ ] Project name: `bell24h`
- [ ] Build command: `npm install && npm run build`
- [ ] Root directory: `client` (in Advanced settings)
- [ ] Output directory: `.next` (in Advanced settings)
- [ ] Framework preset: `Next.js`
- [ ] Node version: `18` or `20`
- [ ] Environment variables added (DATABASE_URL, NODE_ENV, NEXT_PUBLIC_APP_URL)
- [ ] Production branch: `main`

---

## 🐛 **Common Mistakes to Avoid:**

### **Mistake 1: Using Workers Instead of Pages**
- **Symptom:** You see "Deploy command" with `npx wrangler deploy`
- **Fix:** Go back and click the **"Pages"** tab

### **Mistake 2: Forgetting Root Directory**
- **Symptom:** Build fails with "Cannot find package.json"
- **Fix:** Make sure "Root directory" is set to `client` in Advanced settings

### **Mistake 3: Wrong Output Directory**
- **Symptom:** Build succeeds but site shows blank page
- **Fix:** Make sure "Output directory" is set to `.next`

### **Mistake 4: Missing Environment Variables**
- **Symptom:** Site loads but database doesn't work
- **Fix:** Add DATABASE_URL environment variable

### **Mistake 5: Build Command Missing npm install**
- **Symptom:** Build fails with "Cannot find module"
- **Fix:** Make sure build command is `npm install && npm run build` (not just `npm run build`)

---

## 📸 **What Your Settings Should Look Like:**

```
Project name: bell24h
Build command: npm install && npm run build
Deploy command: (empty or not visible)
Builds for non-production branches: ✅ (checked)

Advanced settings:
  Root directory: client
  Output directory: .next
  Framework preset: Next.js
  Node version: 18 (or 20)

Environment Variables:
  DATABASE_URL: (your database URL) [Secret]
  NODE_ENV: production [Secret]
  NEXT_PUBLIC_APP_URL: https://bell24h.com [Secret]
  NEXT_PUBLIC_API_URL: https://bell24h.com/api [Secret]

Production branch: main
```

---

## 🎉 **After Deployment:**

Once the build succeeds:

1. Your site will be live at: `https://bell24h.pages.dev`
2. You can connect your custom domain `bell24h.com` in Settings > Custom domains
3. Cloudflare will automatically deploy new changes when you push to GitHub

---

## 📞 **Need Help?**

If the build fails:
1. Check the build logs in Cloudflare dashboard
2. Look for error messages
3. Verify all settings match the checklist above
4. Make sure you're on the "Pages" tab, not "Workers"

---

## 🎯 **Summary:**

1. ✅ Make sure you're on **"Pages"** tab (NOT Workers)
2. ✅ Fill in all the boxes as shown above
3. ✅ Don't forget Advanced settings (Root directory: `client`, Output directory: `.next`)
4. ✅ Add environment variables (especially DATABASE_URL)
5. ✅ Click "Create and deploy"
6. ✅ Wait for build to complete
7. ✅ Your site will be live!

**You've got this! Follow each step carefully and your site will deploy successfully! 🚀**

