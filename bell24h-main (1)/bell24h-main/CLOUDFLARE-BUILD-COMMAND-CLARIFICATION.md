# 🔧 Cloudflare Pages Build Command Clarification

## ⚠️ **IMPORTANT: Build Command Depends on Root Directory**

### **If Root Directory is Set to `client`:**

When you set **Root directory** to `client` in Cloudflare Pages:
- Cloudflare automatically changes to the `client/` directory
- Your build command runs from within `client/`
- **Build command should be:**
  ```
  npm install && npm run build
  ```
  (No need for `cd client` since you're already there)

---

### **If Root Directory is NOT Set (Root of Repo):**

If you leave **Root directory** empty:
- Cloudflare runs commands from the repository root
- You need to change to the `client/` directory first
- **Build command should be:**
  ```
  cd client && npm install && npm run build
  ```

---

## 🎯 **Recommended Configuration:**

### **Option 1: Set Root Directory to `client` (Recommended)**

**Root directory:** `client`

**Build command:**
```
npm install && npm run build
```

**Output directory:**
```
.next
```

**Why this is better:**
- Simpler build command
- Cloudflare handles the directory change automatically
- Less chance of errors

---

### **Option 2: Leave Root Directory Empty**

**Root directory:** (leave empty)

**Build command:**
```
cd client && npm install && npm run build
```

**Output directory:**
```
client/.next
```

**Why this might be needed:**
- If you have other build steps at the root level
- If you need to access files outside the `client/` directory

---

## 📋 **Quick Reference:**

| Root Directory | Build Command | Output Directory |
|----------------|---------------|------------------|
| `client` | `npm install && npm run build` | `.next` |
| (empty) | `cd client && npm install && npm run build` | `client/.next` |

---

## ✅ **Recommended Setup:**

**Use Option 1** (Set Root Directory to `client`):

1. **Root directory:** `client`
2. **Build command:** `npm install && npm run build`
3. **Output directory:** `.next`
4. **Node version:** `18` or `20`

This is the simplest and most reliable configuration.

---

## 🐛 **Common Errors:**

### **Error: "Cannot find package.json"**

**Cause:** Build command doesn't include `cd client` when root directory is empty.

**Solution:** Either:
- Set root directory to `client` and use `npm install && npm run build`
- OR leave root directory empty and use `cd client && npm install && npm run build`

### **Error: "Cannot find module"**

**Cause:** Dependencies not installed.

**Solution:** Make sure build command includes `npm install`

### **Error: "Build output not found"**

**Cause:** Output directory is incorrect.

**Solution:** 
- If root directory is `client`, use `.next`
- If root directory is empty, use `client/.next`

---

## 🎯 **Final Recommendation:**

**Use this exact configuration:**

- **Root directory:** `client`
- **Build command:** `npm install && npm run build`
- **Output directory:** `.next`
- **Node version:** `18` or `20`
- **Framework preset:** `Next.js`

This will work reliably for your BELL24h deployment!

---

## 📝 **Note About Next.js Config:**

The `output: 'standalone'` in `next.config.js` is **optional** for Cloudflare Pages. The standard Next.js build output works fine. You can keep your current `next.config.js` as-is.

---

**🎯 Use Option 1 for the simplest, most reliable deployment!**

