# 🚀 **TEMPORARY DEMO LOGIN GUIDE**

**Date:** November 16, 2025  
**Status:** ✅ Ready for Testing  
**Purpose:** Test dashboard features without MSG91 configuration

---

## 🎯 **QUICK ACCESS - 3 WAYS TO DEMO LOGIN**

### **Method 1: Direct Demo Login Page (Easiest)**
🌐 **https://bell24h.com/auth/demo-login**

- Click the button on this page
- Automatically sets demo cookies
- Redirects to dashboard

---

### **Method 2: Demo Login Button on Login Page**
🌐 **https://bell24h.com/auth/login-otp**

- Scroll down below the "Send OTP" button
- You'll see: **"⚠️ MSG91 Pending? Use Demo Login for Testing"**
- Click the **"Demo Login (Temporary)"** button (amber/orange color)
- Automatically logs you in and redirects to dashboard

---

### **Method 3: Direct API Call (Advanced)**
If you want to set cookies manually:

**POST Request:**
```bash
curl -X POST https://bell24h.com/api/auth/demo-login \
  -H "Content-Type: application/json" \
  -c cookies.txt
```

Then access dashboard normally.

---

## ✅ **WHAT HAPPENS AFTER DEMO LOGIN**

1. ✅ Sets `auth_token` cookie (middleware checks this)
2. ✅ Sets `session_id` cookie (middleware checks this)
3. ✅ Stores `authToken` in localStorage
4. ✅ Marks `demoMode: true` in localStorage
5. ✅ Redirects to `/dashboard`
6. ✅ You can now access **ALL dashboard pages**!

---

## 🔗 **ALL DASHBOARD LINKS YOU CAN NOW ACCESS**

After demo login, you can access:

| Feature | Link |
|---------|------|
| **Main Dashboard** | https://bell24h.com/dashboard |
| **AI Features** | https://bell24h.com/dashboard/ai-features |
| **AI Insights** | https://bell24h.com/dashboard/ai-insights |
| **Voice RFQ** | https://bell24h.com/dashboard/voice-rfq |
| **Video RFQ** | https://bell24h.com/dashboard/video-rfq |
| **Negotiations** | https://bell24h.com/dashboard/negotiations |
| **Supplier Risk** | https://bell24h.com/dashboard/supplier-risk |
| **Invoice Discounting** | https://bell24h.com/dashboard/invoice-discounting |
| **CRM** | https://bell24h.com/dashboard/crm |
| **N8N** | https://bell24h.com/dashboard/n8n |
| **Comprehensive** | https://bell24h.com/dashboard/comprehensive |

---

## ⚠️ **IMPORTANT NOTES**

### **Temporary Feature:**
- ⚠️ This is **TEMPORARY** for testing only
- ⚠️ **Remove before production deployment**
- ⚠️ Files to remove later:
  - `client/src/app/api/auth/demo-login/route.ts`
  - `client/src/app/auth/demo-login/page.tsx`
  - Demo login button from `client/src/app/auth/login-otp/page.tsx`

### **Demo Mode Indicators:**
- Cookies: `auth_token` and `session_id` set to demo values
- LocalStorage: `demoMode: true`
- User ID: `demo_user_123`
- Mobile: `9999999999`

### **What Works:**
- ✅ Access to all dashboard pages
- ✅ All dashboard features visible
- ✅ UI components and layouts
- ✅ Navigation between pages

### **What Doesn't Work (Expected):**
- ❌ Real OTP verification (bypassed by design)
- ❌ Real MSG91 SMS sending (not configured yet)
- ❌ Real user data (uses mock/demo data)
- ❌ Real API calls (uses demo endpoints)

---

## 🧪 **TESTING CHECKLIST**

After demo login, test these:

- [ ] **Main Dashboard** (`/dashboard`) - All sections load
- [ ] **AI Features** (`/dashboard/ai-features`) - All tabs work
- [ ] **AI Insights** (`/dashboard/ai-insights`) - Data displays
- [ ] **Voice RFQ** (`/dashboard/voice-rfq`) - Upload works
- [ ] **Video RFQ** (`/dashboard/video-rfq`) - Upload works
- [ ] **Negotiations** (`/dashboard/negotiations`) - Interface loads
- [ ] **Supplier Risk** (`/dashboard/supplier-risk`) - Scores display
- [ ] **Invoice Discounting** (`/dashboard/invoice-discounting`) - Form works
- [ ] **CRM** (`/dashboard/crm`) - Contacts load
- [ ] **N8N** (`/dashboard/n8n`) - Workflows visible
- [ ] **Comprehensive** (`/dashboard/comprehensive`) - All features visible

---

## 🔄 **LOGOUT (If Needed)**

To logout and clear demo cookies:

1. Open browser DevTools (F12)
2. Go to **Application** tab → **Cookies** → `bell24h.com`
3. Delete these cookies:
   - `auth_token`
   - `session_id`
4. Go to **Local Storage** → `bell24h.com`
5. Delete:
   - `authToken`
   - `demoMode`
6. Refresh page → You'll be redirected to login

**OR** just clear all site data:
- DevTools → Application → Clear site data → Clear all

---

## 🎉 **READY TO TEST!**

**Next Steps:**
1. ✅ Visit: **https://bell24h.com/auth/demo-login**
2. ✅ Click **"Demo Login (Temporary)"** button
3. ✅ You'll be redirected to `/dashboard`
4. ✅ Test all dashboard features!
5. ✅ Once MSG91 is configured, remove demo login

---

## 📝 **REMOVAL CHECKLIST (Before Production)**

When MSG91 is configured and you're ready for production:

- [ ] Remove `client/src/app/api/auth/demo-login/route.ts`
- [ ] Remove `client/src/app/auth/demo-login/page.tsx`
- [ ] Remove demo login button from `client/src/app/auth/login-otp/page.tsx`
- [ ] Remove `handleDemoLogin` function from login page
- [ ] Test real login with MSG91 OTP
- [ ] Verify middleware works correctly
- [ ] Remove this guide document

---

**✅ Demo login is ready! Start testing your dashboard features now!** 🚀

