# Cloudflare Pages Setup Guide for Bell24h

## ⚠️ IMPORTANT: You're Currently Using Workers (Wrong for Next.js)

**Cloudflare Workers** = For serverless functions/API endpoints
**Cloudflare Pages** = For Next.js/full websites (THIS IS WHAT YOU NEED)

---

## Step 1: Fix Submodule Issue on GitHub

The submodule error is happening because GitHub still has submodule references. Fix it:

### Option A: Check GitHub Website Directly

1. Go to: https://github.com/digitex-erp/bell24h
2. Look for a file named `.gitmodules` in the root directory
3. If it exists:
   - Click on the file
   - Click the trash icon (Delete)
   - Commit the deletion
4. Also check for any folders that show as links (these are submodules)

### Option B: Force Push Clean State (if you're the only contributor)

Run this PowerShell script:
```powershell
.\FIX-SUBMODULES-COMPLETE.ps1
```

This will:
- Remove ALL submodule references from git config
- Clean up .gitmodules
- Force push to GitHub (overwrites remote)

---

## Step 2: Create Cloudflare Pages Project (NOT Workers)

### 2.1 Delete/Disable the Current Worker

1. Go to: https://dash.cloudflare.com
2. Workers & Pages > bell24h (your current Worker)
3. Settings > Scroll down > Click "Delete" (or just leave it, it won't interfere)

### 2.2 Create New Pages Project

1. Go to: https://dash.cloudflare.com
2. Click: **Workers & Pages** (left sidebar)
3. Click: **Create application** (top right)
4. Click: **Pages** tab (NOT Workers)
5. Click: **Connect to Git**
6. Select: **digitex-erp/bell24h**
7. Click: **Begin setup**

### 2.3 Configure Build Settings

**Project name:** `bell24h` (or `bell24h-pages`)

**Production branch:** `main`

**Framework preset:** `Next.js` (auto-detected)

**Build command:**
```
npm run build
```

**Output directory:**
```
.next
```

**OR if using static export:**
```
out
```

**Root directory:** (leave empty, or set to `/` if your Next.js app is in a subfolder)

### 2.4 Environment Variables

Click **"Add variable"** and add:

- **Name:** `DATABASE_URL`
- **Value:** Your Neon database URL (from .env.production)
- **Type:** Secret

- **Name:** `NODE_VERSION`
- **Value:** `18` (or `20`)
- **Type:** Secret

Add any other environment variables your app needs.

### 2.5 Deploy

1. Click **"Save and Deploy"**
2. Wait for build to complete (1-2 minutes)
3. Your site will be live at: `https://bell24h.pages.dev`

---

## Step 3: Connect Custom Domain

1. In your Pages project, go to **Settings** > **Custom domains**
2. Click **"Set up a custom domain"**
3. Enter: `bell24h.com`
4. Cloudflare will automatically configure DNS (since your domain is already on Cloudflare)
5. SSL will be automatically enabled

---

## Step 4: Clear Build Cache (After First Deploy)

1. Go to your Pages project
2. **Settings** > **Builds & deployments**
3. Scroll down to **"Build cache"**
4. Click **"Clear build cache"**
5. Go to **Deployments** tab
6. Click **"Retry deployment"** on the latest deployment

---

## Troubleshooting

### "Error occurred while updating repository submodules"

**Solution:**
1. Run `.\FIX-SUBMODULES-COMPLETE.ps1`
2. OR manually delete `.gitmodules` from GitHub website
3. Clear build cache in Cloudflare Pages
4. Retry deployment

### "Build failed - Next.js error"

**Solution:**
1. Check build logs in Cloudflare Pages
2. Make sure all environment variables are set
3. Check that `package.json` has correct build script
4. Verify `next.config.js` is configured correctly

### "Site shows blank page"

**Solution:**
1. Check that `output: 'export'` is NOT in `next.config.js` (unless you want static export)
2. Make sure your `page.tsx` or `index.js` exists in `app/` or `pages/` directory
3. Check browser console for errors

---

## Difference: Workers vs Pages

| Feature | Workers | Pages |
|---------|---------|-------|
| Use Case | API endpoints, serverless functions | Full websites, Next.js apps |
| Framework | Not for Next.js | Perfect for Next.js |
| Build | No build process | Full build process |
| Routes | API routes only | Full app routing |
| **For Bell24h** | ❌ Wrong | ✅ Correct |

---

## Quick Checklist

- [ ] Run `.\FIX-SUBMODULES-COMPLETE.ps1` to remove submodules
- [ ] Delete `.gitmodules` from GitHub (if exists)
- [ ] Create Cloudflare **Pages** project (not Workers)
- [ ] Connect GitHub repo
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `.next` or `out`
- [ ] Add environment variables (DATABASE_URL, etc.)
- [ ] Deploy
- [ ] Connect custom domain: `bell24h.com`
- [ ] Clear build cache
- [ ] Retry deployment

---

## Success!

Once deployed, your site will be:
- ✅ Live at: `https://bell24h.com`
- ✅ Fast (9ms India latency)
- ✅ Free (Cloudflare Pages free tier)
- ✅ Auto-deploy on every git push
- ✅ SSL enabled automatically

---

## Need Help?

If you still get submodule errors:
1. Check GitHub: https://github.com/digitex-erp/bell24h
2. Look for `.gitmodules` file → Delete it
3. Check for any submodule folders → Delete them
4. Force push: `git push origin main --force`
5. Clear Cloudflare build cache
6. Retry deployment

