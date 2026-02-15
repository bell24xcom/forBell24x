# ✅ MSG91 OTP SETUP - COMPLETE GUIDE

## 🎉 **WHAT YOU HAVE:**

✅ **MSG91 Auth Key:** `468517Ak5rJ0vb7NDV68c24863P1`  
✅ **Account Name:** BELL24H  
✅ **Authkey Status:** Active  
✅ **IP Security:** OFF (Good for development, consider ON for production)

---

## ⚠️ **WHAT YOU STILL NEED:**

### **1. OTP Template ID** (REQUIRED)

MSG91 requires an **OTP Template** to send OTPs. You need to create one:

**Steps to Create OTP Template:**

1. **Go to MSG91 Dashboard:**
   - Visit: https://control.msg91.com/
   - Login to your account

2. **Navigate to Templates:**
   - Click on "Templates" or "OTP Templates" in the sidebar
   - Or go to: https://control.msg91.com/templates

3. **Create New OTP Template:**
   - Click "+ Create Template" or "Add Template"
   - Select "OTP Template" type

4. **Template Content:**
   ```
   Your OTP for Bell24h login is {{otp}}. Valid for 5 minutes. Do not share this OTP with anyone.
   ```
   
   **OR simpler:**
   ```
   Your Bell24h OTP is {{otp}}. Valid for 5 minutes.
   ```

5. **Important Variables:**
   - Must include `{{otp}}` placeholder (MSG91 will replace with actual OTP)
   - Keep it under 160 characters
   - No need for sender ID in template (it's set separately)

6. **Submit & Get Template ID:**
   - After approval, you'll get a **Template ID** (usually a number like `1234567890123456789`)
   - Copy this Template ID

---

## 🔧 **COMPLETE SETUP:**

### **Step 1: Add to `.env.local` (Local Development)**

Create or update `client/.env.local`:

```env
# MSG91 Configuration (FROM YOUR DASHBOARD)
MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
MSG91_SENDER_ID=BELL24H
MSG91_TEMPLATE_ID=YOUR_TEMPLATE_ID_HERE  # ← Get this from MSG91 Templates section
MSG91_ROUTE=4

# JWT Secret (Generate a random string)
JWT_SECRET=bell24h_super_secret_jwt_key_2024_change_this_in_production

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### **Step 2: Add to Vercel (Production)**

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Select your project: `bell24h`

2. **Add Environment Variables:**
   - Settings → Environment Variables
   - Add each variable:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `MSG91_AUTH_KEY` | `468517Ak5rJ0vb7NDV68c24863P1` | Your auth key |
| `MSG91_SENDER_ID` | `BELL24H` | Your sender ID |
| `MSG91_TEMPLATE_ID` | `(your template ID)` | Get from MSG91 |
| `MSG91_ROUTE` | `4` | Transactional route |
| `JWT_SECRET` | `(random secret)` | Generate a secure string |
| `NEXT_PUBLIC_APP_URL` | `https://bell24h.com` | Your domain |

---

## 📋 **CHECKLIST:**

- [x] MSG91 Auth Key: `468517Ak5rJ0vb7NDV68c24863P1` ✅
- [x] MSG91 Account Active ✅
- [ ] OTP Template Created (DO THIS NOW)
- [ ] Template ID Retrieved
- [ ] Added to `.env.local`
- [ ] Added to Vercel Environment Variables

---

## 🎯 **NEXT STEPS (5 MINUTES):**

### **1. Create OTP Template** (2 min)
- Go to: https://control.msg91.com/templates
- Create OTP template with `{{otp}}` placeholder
- Copy Template ID

### **2. Update `.env.local`** (1 min)
- Add Template ID to `.env.local`
- Restart dev server: `npm run dev`

### **3. Test OTP Login** (2 min)
- Visit: http://localhost:3000/auth/login-otp
- Enter mobile number
- Click "Send OTP"
- Check your phone for OTP
- Enter OTP and verify

---

## 🔐 **SECURITY RECOMMENDATIONS:**

### **For Production:**

1. **Enable IP Security:**
   - In MSG91 Dashboard → Settings → Authkey
   - Turn "IP Security" ON
   - Add Vercel IP addresses:
     - Get Vercel IPs from: https://vercel.com/docs/security/deployment-protection#ip-addresses
     - Or use CIDR ranges if provided

2. **Secure JWT Secret:**
   - Generate a strong random string:
     ```bash
     openssl rand -base64 32
     ```
   - Use this as `JWT_SECRET`

3. **Rate Limiting:**
   - Consider adding rate limits for OTP requests
   - MSG91 has built-in limits, but add app-level limits too

---

## 📝 **QUICK REFERENCE:**

**MSG91 Auth Key:** `468517Ak5rJ0vb7NDV68c24863P1`  
**Sender ID:** `BELL24H`  
**Route:** `4` (Transactional)  
**Template ID:** `[PENDING - CREATE IN MSG91]`

---

## ✅ **ONCE YOU HAVE TEMPLATE ID:**

1. Add it to `.env.local`
2. Test locally
3. Add to Vercel
4. Deploy!

**You're 90% done! Just need the Template ID!** 🚀

---

## 💡 **TIP:**

MSG91 templates sometimes take a few minutes to activate after creation. If OTP doesn't send immediately, wait 2-3 minutes and try again.

---

## 🎯 **WHAT TO DO NOW:**

1. **Create OTP Template in MSG91** (2 min)
2. **Get Template ID** (1 min)
3. **Add to `.env.local`** (30 sec)
4. **Test OTP login** (2 min)
5. **Deploy!** (3 min)

**Total time: ~10 minutes to complete everything!**

