# 🎯 MSG91 OTP - QUICK SETUP GUIDE

## ✅ **WHAT YOU HAVE (FROM YOUR DASHBOARD):**

✅ **MSG91 Auth Key:** `468517Ak5rJ0vb7NDV68c24863P1`  
✅ **Sender ID:** `BELL24H`  
✅ **Account Status:** Active  
✅ **IP Security:** OFF (Good for development)

---

## ⚠️ **WHAT YOU NEED NOW:**

### **1. OTP Template ID** (REQUIRED - 5 minutes)

MSG91 requires an **OTP Template** before you can send OTPs.

**Steps:**

1. **Go to MSG91 Templates:**
   - Visit: https://control.msg91.com/templates
   - OR: Dashboard → Templates → OTP Templates

2. **Create New Template:**
   - Click "+ Create Template" or "Add Template"
   - Template Type: **OTP Template**
   - Template Name: `Bell24h Login OTP`
   - Template Content:
     ```
     Your Bell24h login OTP is {{otp}}. Valid for 5 minutes. Do not share.
     ```
   - **IMPORTANT:** Must include `{{otp}}` placeholder (MSG91 replaces this with actual OTP)

3. **Submit & Wait for Approval:**
   - Submit the template
   - MSG91 will approve it (usually instant or within few minutes)
   - After approval, you'll see a **Template ID** (looks like: `1234567890123456789`)

4. **Copy Template ID:**
   - This is the `MSG91_TEMPLATE_ID` you need

---

## 🔧 **COMPLETE SETUP:**

### **Step 1: Create `.env.local` File**

Create file: `client/.env.local`

```env
# MSG91 Configuration (FROM YOUR DASHBOARD)
MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
MSG91_SENDER_ID=BELL24H
MSG91_TEMPLATE_ID=YOUR_TEMPLATE_ID_HERE
MSG91_ROUTE=4

# JWT Secret (Generate a random string)
# Run: openssl rand -base64 32
JWT_SECRET=bell24h_super_secret_jwt_key_2024_change_this

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Step 2: Add to Vercel (For Production)**

1. Go to: https://vercel.com/dashboard
2. Select project: `bell24h`
3. Settings → Environment Variables
4. Add all variables from above

---

## ✅ **CHECKLIST:**

- [x] MSG91 Auth Key: `468517Ak5rJ0vb7NDV68c24863P1` ✅
- [x] Sender ID: `BELL24H` ✅
- [ ] **Create OTP Template** ← DO THIS NOW
- [ ] **Get Template ID** ← Copy from MSG91
- [ ] Add Template ID to `.env.local`
- [ ] Test OTP login locally
- [ ] Add to Vercel environment variables

---

## 🧪 **TEST AFTER SETUP:**

1. **Start dev server:**
   ```bash
   cd client
   npm run dev
   ```

2. **Visit OTP Login:**
   - http://localhost:3000/auth/login-otp

3. **Test Flow:**
   - Enter your mobile number
   - Click "Send OTP"
   - Check your phone for SMS
   - Enter OTP received
   - Verify login works

---

## 📋 **TEMPLATE CONTENT EXAMPLES:**

**Option 1 (Simple):**
```
Your Bell24h OTP is {{otp}}. Valid for 5 minutes.
```

**Option 2 (Detailed):**
```
Your Bell24h login OTP is {{otp}}. Valid for 5 minutes. Do not share with anyone.
```

**Option 3 (With Branding):**
```
Welcome to Bell24h! Your login OTP is {{otp}}. Valid for 5 minutes. -Team Bell24h
```

**All must include `{{otp}}` placeholder!**

---

## 🚀 **DEPLOYMENT STATUS:**

| Item | Status | Action |
|------|--------|--------|
| Auth Key | ✅ Ready | `468517Ak5rJ0vb7NDV68c24863P1` |
| Sender ID | ✅ Ready | `BELL24H` |
| Template | ⚠️ **PENDING** | Create in MSG91 |
| Template ID | ⚠️ **PENDING** | Get after creation |
| Local Env | ⏳ Ready | Add Template ID |
| Vercel Env | ⏳ Ready | Add after local test |

---

## 💡 **QUICK SUMMARY:**

**You have:** ✅ Auth Key  
**You need:** ⚠️ Template ID  
**Time:** 5 minutes to create template  
**Action:** Create OTP template in MSG91 dashboard  

---

## 🎯 **NEXT STEPS:**

1. **Create OTP Template** in MSG91 (5 min)
2. **Get Template ID** from MSG91
3. **Add to `.env.local`**
4. **Test locally**
5. **Deploy!**

**You're 90% done! Just need the Template ID!** 🚀

