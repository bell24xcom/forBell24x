# Vercel Environment Variables Setup

## CRITICAL: Required Environment Variables

To fix "No Neon Database Connected" and authentication issues, you **MUST** set these environment variables in your Vercel project:

### 🔴 Steps to Fix:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Select your project**: bell24h
3. **Go to Settings → Environment Variables**
4. **Add ALL variables below**

---

## 📋 Required Environment Variables

Copy these exact values from your `.env.production` file:

### Database (CRITICAL - Fixes "No Neon Database Connected")
```bash
DATABASE_URL=postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DIRECT_URL=postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

### Authentication (CRITICAL - Fixes login/logout issues)
```bash
NEXTAUTH_SECRET=bell24h_neon_production_secret_2024
NEXTAUTH_URL=https://www.bell24h.com
JWT_SECRET=9+vZ1jkQgzZA74Dq1oqSoIPUQsQknESCBIWEdmGC/GVAYsRU78idRP4FRAPYVL65
JWT_REFRESH_SECRET=OBhGJHTSqXWYNWh9duPpvA8x7DTOZdBuzusKrTyLjcF70xIJcw2zRmanR5o6DgjU
NODE_ENV=production
```

### MSG91 OTP (CRITICAL - Fixes login)
```bash
MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
NEXT_PUBLIC_MSG91_WIDGET_ID=366274707043373833363336
NEXT_PUBLIC_MSG91_TOKEN_AUTH=468517TtdprXApdr36935092aP1
PILOT_OTP_IN_RESPONSE=false
```

### Payment (Razorpay)
```bash
RAZORPAY_KEY_ID=rzp_live_RJjxcgaBo9j0UA
RAZORPAY_KEY_SECRET=lwTxLReQSkVL7lbrr39XSoyG
```

### InsForge Backend
```bash
INSFORGE_URL=https://3hbtn5wm.ap-southeast.insforge.app
INSFORGE_API_KEY=ik_7b677fc7c523f9f9d4d191a11994702f
```

### NVIDIA AI Keys
```bash
NVIDIA_MINIMAX_KEY=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
NVIDIA_DEEPSEEK_KEY=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
NVIDIA_KIMI_KEY=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
NVIDIA_GPT_OSS_KEY=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
NVIDIA_API_KEY=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
```

---

## 🔧 How to Add in Vercel

For **EACH** variable above:

1. Click **"Add New"** button
2. Enter the **Key** (e.g., `DATABASE_URL`)
3. Enter the **Value** (the actual value from above)
4. Select **Environment**: `Production`, `Preview`, and `Development` (check all 3)
5. Click **Save**

---

## ✅ After Adding All Variables

1. Go to **Deployments** tab
2. Find your latest deployment
3. Click **"..."** menu → **"Redeploy"**
4. Wait for deployment to complete (~2-3 minutes)
5. Test the site - all errors should be fixed!

---

## 🚨 Common Mistakes to Avoid

- ❌ Don't add quotes around values (Vercel does this automatically)
- ❌ Don't forget to check all 3 environments (Production, Preview, Development)
- ❌ Don't skip `NEXT_PUBLIC_` prefixed variables (they're needed for client-side)
- ✅ Make sure there are NO trailing spaces in values
- ✅ Redeploy after adding ALL variables (not one by one)

---

## 🔍 Verification

After redeployment, check:
- ✅ `/dashboard` loads without 500 error
- ✅ `/dashboard/quotes` shows data (not error)
- ✅ `/categories/chemicals` loads properly
- ✅ Logout button works
- ✅ Login doesn't require double authentication

---

**Estimated time:** 10-15 minutes to add all variables + 3 minutes deployment
